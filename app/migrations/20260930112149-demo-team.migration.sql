-- demo team: two managers, eight reps, sixty deals this quarter, eight weeks
-- of calls and Monday snapshots. Every login's password is "forecast".
/** @env development */

insert into users (email, name, role, passwordHash)
     select u.email, u.name, u.role::userRole, h.hash
       from (values
  ('dana.whitfield@commitvane.test',  'Dana Whitfield',  'manager'),
  ('marcus.chen@commitvane.test',     'Marcus Chen',     'manager'),
  ('priya.raman@commitvane.test',     'Priya Raman',     'rep'),
  ('jordan.ellis@commitvane.test',    'Jordan Ellis',    'rep'),
  ('mateo.alvarez@commitvane.test',   'Mateo Alvarez',   'rep'),
  ('hannah.brooks@commitvane.test',   'Hannah Brooks',   'rep'),
  ('samuel.okafor@commitvane.test',   'Samuel Okafor',   'rep'),
  ('grace.lindqvist@commitvane.test', 'Grace Lindqvist', 'rep'),
  ('theo.nakamura@commitvane.test',   'Theo Nakamura',   'rep'),
  ('aisha.patel@commitvane.test',     'Aisha Patel',     'rep')
       ) as u(email, name, role)
      cross join (select crypt('forecast', genSalt('bf', 10)) as hash) h;

insert into quotas (repId, quarter, amount)
     select u.id, date_trunc('quarter', current_date)::date, q.amount
       from (values
  ('priya.raman@commitvane.test', 320000),
  ('jordan.ellis@commitvane.test', 280000),
  ('mateo.alvarez@commitvane.test', 300000),
  ('hannah.brooks@commitvane.test', 350000),
  ('samuel.okafor@commitvane.test', 260000),
  ('grace.lindqvist@commitvane.test', 310000),
  ('theo.nakamura@commitvane.test', 290000),
  ('aisha.patel@commitvane.test', 330000)
       ) as q(email, amount)
       join users u on u.email = q.email;

insert into deals (repId, account, name, amount, stageId, closeDate, category)
     select u.id, d.account, d.name, d.amount, s.id,
            least(date_trunc('quarter', current_date)::date + d.day, (date_trunc('quarter', current_date) + interval '3 months - 1 day')::date),
            d.category::forecastCategory
       from (values
  ('priya.raman@commitvane.test', 'Northwind Logistics', 'New logo: core seats', 12000, 'Closed won', 9, 'closed'),
  ('priya.raman@commitvane.test', 'Halcyon Health', 'Multi-year upgrade', 35000, 'Closed won', 31, 'closed'),
  ('priya.raman@commitvane.test', 'Brightline Energy', 'Regional rollout', 48000, 'Closed won', 52, 'closed'),
  ('priya.raman@commitvane.test', 'Copperleaf Foods', 'Regional rollout', 72000, 'Proposal', 91, 'commit'),
  ('priya.raman@commitvane.test', 'Vantage Freight', 'Pilot to production', 39000, 'Negotiation', 91, 'commit'),
  ('priya.raman@commitvane.test', 'Meridian Bank', 'Security bundle', 18000, 'Discovery', 91, 'bestCase'),
  ('priya.raman@commitvane.test', 'Oakridge Schools', 'Security bundle', 101000, 'Proposal', 91, 'bestCase'),
  ('priya.raman@commitvane.test', 'Pioneer Robotics', 'Security bundle', 74000, 'Qualification', 91, 'pipeline'),
  ('jordan.ellis@commitvane.test', 'Silverpine Hotels', 'New logo: core seats', 112000, 'Closed won', 68, 'closed'),
  ('jordan.ellis@commitvane.test', 'Tidewater Insurance', 'Enterprise expansion', 104000, 'Closed won', 83, 'closed'),
  ('jordan.ellis@commitvane.test', 'Ironclad Security', 'Security bundle', 45000, 'Negotiation', 91, 'commit'),
  ('jordan.ellis@commitvane.test', 'Bluebird Airlines', 'New logo: core seats', 73000, 'Proposal', 84, 'commit'),
  ('jordan.ellis@commitvane.test', 'Granite Peak Mining', 'Enterprise expansion', 74000, 'Discovery', 91, 'bestCase'),
  ('jordan.ellis@commitvane.test', 'Lumen Optics', 'New logo: core seats', 94000, 'Prospecting', 91, 'pipeline'),
  ('jordan.ellis@commitvane.test', 'Cascade Water', 'Enterprise expansion', 72000, 'Discovery', 91, 'pipeline'),
  ('mateo.alvarez@commitvane.test', 'Everstone Realty', 'New logo: core seats', 57000, 'Closed won', 23, 'closed'),
  ('mateo.alvarez@commitvane.test', 'Kestrel Aerospace', 'Multi-year upgrade', 59000, 'Closed won', 44, 'closed'),
  ('mateo.alvarez@commitvane.test', 'Harborview Clinics', 'Security bundle', 80000, 'Closed won', 62, 'closed'),
  ('mateo.alvarez@commitvane.test', 'Quillfeather Press', 'Pilot to production', 62000, 'Proposal', 91, 'commit'),
  ('mateo.alvarez@commitvane.test', 'Redwood Analytics', 'Security bundle', 69000, 'Discovery', 91, 'bestCase'),
  ('mateo.alvarez@commitvane.test', 'Summit Outdoor', 'Multi-year upgrade', 56000, 'Discovery', 91, 'bestCase'),
  ('mateo.alvarez@commitvane.test', 'Aurora Biotech', 'Regional rollout', 44000, 'Prospecting', 91, 'pipeline'),
  ('mateo.alvarez@commitvane.test', 'Blackwell Legal', 'Analytics add-on', 91000, 'Prospecting', 84, 'pipeline'),
  ('hannah.brooks@commitvane.test', 'Crescent Retail', 'Security bundle', 29000, 'Closed won', 77, 'closed'),
  ('hannah.brooks@commitvane.test', 'Driftwood Media', 'Enterprise expansion', 36000, 'Closed won', 14, 'closed'),
  ('hannah.brooks@commitvane.test', 'Emberline Gaming', 'Security bundle', 62000, 'Negotiation', 91, 'commit'),
  ('hannah.brooks@commitvane.test', 'Foxglove Pharma', 'Regional rollout', 109000, 'Proposal', 90, 'commit'),
  ('hannah.brooks@commitvane.test', 'Glacier Telecom', 'Platform renewal', 42000, 'Negotiation', 91, 'commit'),
  ('hannah.brooks@commitvane.test', 'Hollow Oak Farms', 'Pilot to production', 12000, 'Discovery', 91, 'bestCase'),
  ('hannah.brooks@commitvane.test', 'Juniper Credit Union', 'Security bundle', 66000, 'Discovery', 91, 'bestCase'),
  ('hannah.brooks@commitvane.test', 'Keystone Manufacturing', 'Analytics add-on', 33000, 'Qualification', 84, 'pipeline'),
  ('samuel.okafor@commitvane.test', 'Larkspur Fashion', 'Pilot to production', 12000, 'Closed won', 36, 'closed'),
  ('samuel.okafor@commitvane.test', 'Maple & Main Grocers', 'Security bundle', 113000, 'Closed won', 55, 'closed'),
  ('samuel.okafor@commitvane.test', 'Nimbus Cloudworks', 'Pilot to production', 33000, 'Proposal', 91, 'commit'),
  ('samuel.okafor@commitvane.test', 'Orchard Capital', 'Multi-year upgrade', 41000, 'Proposal', 91, 'bestCase'),
  ('samuel.okafor@commitvane.test', 'Parallax Studios', 'Pilot to production', 17000, 'Discovery', 91, 'pipeline'),
  ('samuel.okafor@commitvane.test', 'Quarry Construction', 'Security bundle', 57000, 'Prospecting', 91, 'pipeline'),
  ('samuel.okafor@commitvane.test', 'Riverbend Utilities', 'Security bundle', 24000, 'Discovery', 84, 'pipeline'),
  ('grace.lindqvist@commitvane.test', 'Sable Automotive', 'Security bundle', 107000, 'Closed won', 71, 'closed'),
  ('grace.lindqvist@commitvane.test', 'Thistle Home Goods', 'Enterprise expansion', 96000, 'Closed won', 86, 'closed'),
  ('grace.lindqvist@commitvane.test', 'Umbra Cybersecurity', 'Analytics add-on', 92000, 'Closed won', 27, 'closed'),
  ('grace.lindqvist@commitvane.test', 'Verdant Agritech', 'New logo: core seats', 38000, 'Negotiation', 87, 'commit'),
  ('grace.lindqvist@commitvane.test', 'Westgate Mall Group', 'Pilot to production', 80000, 'Proposal', 91, 'commit'),
  ('grace.lindqvist@commitvane.test', 'Yarrow Wellness', 'Security bundle', 59000, 'Proposal', 91, 'bestCase'),
  ('grace.lindqvist@commitvane.test', 'Zephyr Wind Power', 'Enterprise expansion', 101000, 'Qualification', 90, 'pipeline'),
  ('theo.nakamura@commitvane.test', 'Alder Transit', 'Analytics add-on', 83000, 'Closed won', 48, 'closed'),
  ('theo.nakamura@commitvane.test', 'Birchwood Senior Living', 'Security bundle', 73000, 'Closed won', 65, 'closed'),
  ('theo.nakamura@commitvane.test', 'Cobalt Payments', 'Enterprise expansion', 65000, 'Negotiation', 91, 'commit'),
  ('theo.nakamura@commitvane.test', 'Dunmore Distillers', 'Multi-year upgrade', 85000, 'Negotiation', 91, 'commit'),
  ('theo.nakamura@commitvane.test', 'Elmstead University', 'Platform renewal', 95000, 'Proposal', 91, 'bestCase'),
  ('theo.nakamura@commitvane.test', 'Fairhaven County', 'Pilot to production', 45000, 'Discovery', 91, 'bestCase'),
  ('theo.nakamura@commitvane.test', 'Goldcrest Jewelers', 'Analytics add-on', 38000, 'Prospecting', 91, 'pipeline'),
  ('theo.nakamura@commitvane.test', 'Hawthorne Dental', 'Security bundle', 19000, 'Discovery', 90, 'pipeline'),
  ('aisha.patel@commitvane.test', 'Indigo Travel', 'Platform renewal', 87000, 'Closed won', 80, 'closed'),
  ('aisha.patel@commitvane.test', 'Jasper Chemicals', 'Pilot to production', 96000, 'Closed won', 19, 'closed'),
  ('aisha.patel@commitvane.test', 'Kingfisher Marine', 'Enterprise expansion', 111000, 'Closed won', 40, 'closed'),
  ('aisha.patel@commitvane.test', 'Lodestar Mapping', 'Platform renewal', 21000, 'Negotiation', 91, 'commit'),
  ('aisha.patel@commitvane.test', 'Mosaic Charities', 'Enterprise expansion', 79000, 'Discovery', 91, 'bestCase'),
  ('aisha.patel@commitvane.test', 'Nettle Coffee Co', 'Analytics add-on', 34000, 'Discovery', 91, 'bestCase'),
  ('aisha.patel@commitvane.test', 'Onyx Data Centers', 'Regional rollout', 101000, 'Qualification', 91, 'pipeline')
       ) as d(email, account, name, amount, stage, day, category)
       join users u on u.email = d.email
       join stages s on s.name = d.stage;

-- Each rep's numbers as they stand now, and the deals that closed after a
-- given Monday, which were still open that week.
create temporary table seedWeeks on commit drop as
  with weeks as (
    select k, (date_trunc('week', current_date)::date - 7 * k) as weekOf,
           (7 - k) / 7.0 as t
      from generate_series(0, 7) as k
  )
  select u.id as repId, u.email, w.k, w.weekOf, w.t,
         (abs(hashtext(u.email || ':' || w.k)) % 1000) / 1000.0 as jitter,
         coalesce(sum(d.amount) filter (where d.category = 'closed' and d.closeDate < w.weekOf), 0) as closedThen,
         coalesce(sum(d.amount) filter (where d.category = 'closed' and d.closeDate >= w.weekOf), 0) as closedLater,
         coalesce(sum(d.amount) filter (where d.category = 'commit'), 0) as commitNow,
         coalesce(sum(d.amount) filter (where d.category = 'bestCase'), 0) as bestCaseNow,
         coalesce(sum(d.amount) filter (where d.category = 'pipeline'), 0) as pipelineNow
    from users u
   cross join weeks w
    left join deals d on d.repId = u.id
   where u.role = 'rep'
   group by u.id, u.email, w.k, w.weekOf, w.t;

-- Deals migrate from pipeline toward commit as the quarter goes on.
create temporary table seedSnapshots on commit drop as
  select repId, email, k, weekOf, jitter,
         closedThen::int as closedAmount,
         round(commitNow * (0.45 + 0.55 * t) + closedLater * (0.55 + 0.35 * t) + 4000 * jitter, -3)::int as commitAmount,
         round(bestCaseNow * (0.85 + 0.15 * t) + commitNow * 0.4 * (1 - t) + closedLater * 0.3 * (1 - t), -3)::int as bestCaseAmount,
         round(pipelineNow * (1 + 0.5 * (1 - t)) + closedLater * 0.15 * (1 - t) + 6000 * jitter, -3)::int as pipelineAmount
    from seedWeeks;

-- One call a week, Tuesday at 9am Pacific. Samuel and Theo have not called in yet
-- this week.
insert into calls (repId, quarter, commitAmount, bestCaseAmount, createdAt, updatedAt)
     select s.repId, date_trunc('quarter', current_date)::date,
            round((s.closedAmount + s.commitAmount) * (0.86 + 0.32 * s.jitter), -4)::int,
            round((s.closedAmount + s.commitAmount) * (0.86 + 0.32 * s.jitter) + s.bestCaseAmount * (0.45 + 0.4 * s.jitter), -4)::int,
            (s.weekOf + interval '1 day 9 hours') at time zone 'America/Los_Angeles',
            (s.weekOf + interval '1 day 9 hours') at time zone 'America/Los_Angeles'
       from seedSnapshots s
      where (s.weekOf + interval '1 day 9 hours') at time zone 'America/Los_Angeles' < now()
        and not (s.k = 0 and s.email in ('samuel.okafor@commitvane.test', 'theo.nakamura@commitvane.test'));

insert into snapshots (repId, quarter, weekOf, quota, closedAmount, commitAmount,
                       bestCaseAmount, pipelineAmount, weightedAmount, callCommit,
                       callBestCase, createdAt, updatedAt)
     select s.repId, date_trunc('quarter', current_date)::date, s.weekOf, q.amount,
            s.closedAmount, s.commitAmount, s.bestCaseAmount, s.pipelineAmount,
            round(s.closedAmount + s.commitAmount * 0.75 + s.bestCaseAmount * 0.5 + s.pipelineAmount * 0.2, -3)::int,
            c.commitAmount, c.bestCaseAmount,
            (s.weekOf + interval '7 hours') at time zone 'America/Los_Angeles',
            (s.weekOf + interval '7 hours') at time zone 'America/Los_Angeles'
       from seedSnapshots s
       join quotas q on q.repId = s.repId and q.quarter = date_trunc('quarter', current_date)::date
       left join lateral (
             select commitAmount, bestCaseAmount
               from calls
              where calls.repId = s.repId
                and calls.createdAt < (s.weekOf + interval '7 hours') at time zone 'America/Los_Angeles'
              order by createdAt desc
              limit 1
       ) c on true;
