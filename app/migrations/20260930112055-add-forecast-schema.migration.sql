-- add forecast schema

-- Auto-update updatedAt on row changes.
create or replace function touchUpdatedAt()
returns trigger
language plpgsql
as $$
begin
  new.updatedAt = now();
  return new;
end;
$$;

create type userRole as enum ('rep', 'manager');

-- Ordered from least to most certain; the dashboard and charts read them in
-- this order.
create type forecastCategory as enum ('pipeline', 'bestCase', 'commit', 'closed');

create table users (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  email text not null unique,
  name text not null,
  role userRole not null default 'rep',
  passwordHash text not null
);

create trigger usersTouchUpdatedAt
  before update on users
  for each row execute function touchUpdatedAt();

create table stages (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  name text not null unique,
  position integer not null unique,
  probability integer not null check (probability between 0 and 100)
);

create trigger stagesTouchUpdatedAt
  before update on stages
  for each row execute function touchUpdatedAt();

-- Every environment needs the stages; managers tune the probabilities.
insert into stages (name, position, probability) values
  ('Prospecting',   1, 10),
  ('Qualification', 2, 20),
  ('Discovery',     3, 40),
  ('Proposal',      4, 60),
  ('Negotiation',   5, 80),
  ('Closed won',    6, 100);

-- quarter is the first day of the quarter: date_trunc('quarter', ...).
create table quotas (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  repId uuid not null references users(id) on delete cascade,
  quarter date not null,
  amount integer not null check (amount >= 0),
  unique (repId, quarter)
);

create trigger quotasTouchUpdatedAt
  before update on quotas
  for each row execute function touchUpdatedAt();

create table deals (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  repId uuid not null references users(id) on delete cascade,
  account text not null,
  name text not null,
  amount integer not null check (amount >= 0),
  stageId uuid not null references stages(id),
  closeDate date not null,
  category forecastCategory not null default 'pipeline'
);

create index dealsRepCloseDateIdx on deals (repId, closeDate);

create trigger dealsTouchUpdatedAt
  before update on deals
  for each row execute function touchUpdatedAt();

-- A rep's weekly call. Every submission is kept; the latest one in a quarter
-- is the call.
create table calls (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  repId uuid not null references users(id) on delete cascade,
  quarter date not null,
  commitAmount integer not null check (commitAmount >= 0),
  bestCaseAmount integer not null check (bestCaseAmount >= 0)
);

create index callsRepQuarterIdx on calls (repId, quarter, createdAt desc);

create trigger callsTouchUpdatedAt
  before update on calls
  for each row execute function touchUpdatedAt();

-- Monday snapshots of each rep's numbers, so week over week has history.
-- Amounts are per category, not rolled up.
create table snapshots (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  repId uuid not null references users(id) on delete cascade,
  quarter date not null,
  weekOf date not null,
  quota integer not null,
  closedAmount integer not null,
  commitAmount integer not null,
  bestCaseAmount integer not null,
  pipelineAmount integer not null,
  weightedAmount integer not null,
  callCommit integer,
  callBestCase integer,
  unique (repId, weekOf)
);

create trigger snapshotsTouchUpdatedAt
  before update on snapshots
  for each row execute function touchUpdatedAt();
