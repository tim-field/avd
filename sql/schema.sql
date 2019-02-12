create extension cube;

create table track (
	id text not null,
	arousal float null,
	valence float null,
	"depth" float null,
	avd cube,
	play_count int null default 1,
	liked_count int null,
	"json" jsonb null,
	primary key (id)
);

create index track_avd_idx on track using gist (avd);

create table "user" (
	id text not null,
	"json" jsonb null,
	primary key (id)
);

create table user_follow (
	user_id text not null,
	following_id text not null,
	primary key (user_id, following_id)
);

create table user_track (
	track_id text not null,
	user_id text not null, 
	arousal smallint,
	valence smallint,
	depth smallint,
	last_heard_at timestamptz not null default current_timestamp,
	first_heard_at timestamptz not null default current_timestamp,
	play_count int default 1,
	liked boolean,
	primary key (track_id, user_id)
);

create table playlist (
	id text not null,
	user_id text not null,
	"name" text not null,
	-- arousal smallint[] not null default array[0, 0],
	-- valence smallint[] not null default array[0, 0],
	-- "depth" smallint[] not null default array[0, 0],
	track_query jsonb not null,
	"json" jsonb null,
	primary key (id, user_id)
);

-- DROP FUNCTION closest(numeric,numeric,numeric,text);
-- create or replace function closest(a numeric,v numeric,d numeric ,user_id text, skip text[] default array[]::text[])
-- returns track as $$
-- 	select track.*
-- 	from 
-- 		track 
-- 	left join 
-- 		user_track on user_track.track_id = track.id 
-- 	where 
-- 		user_track.user_id = user_id
-- 		and not (track.id = ANY (skip))
-- 	order by 
-- 		abs(coalesce(user_track.arousal, track.arousal) - a) 
-- 		+ abs(coalesce(user_track.valence, track.valence) - v) 
-- 		+ abs(coalesce(user_track."depth", track."depth") - d) 
-- 	limit 1;
-- $$ language sql stable;

-- Not finding enough tracks with this - but it's very fast, might need to iterate it incrementing the 0.5 value
-- create or replace function closest(a numeric,v numeric,d numeric ,user_id text, skip text[] default array[]::text[])
-- returns track as $$
-- 	select 
-- 	track.*
-- 	from 
-- 		track 
-- 	left join 
-- 		user_track on user_track.track_id = track.id 
-- 	where 
-- 		user_track.user_id = user_id
-- 		and track.avd <-> cube(array[a,v,d]) < 0.5
-- 		and not (track.id = ANY (skip))
-- 	order by 
-- 		 track.play_count
-- 	 limit 1;
-- $$ language sql stable;

create or replace function closest(a numeric,v numeric,d numeric ,user_id text, skip text[] default array[]::text[])
returns track as $$
	select 
	track.*
	from 
		track 
	left join 
		user_track on user_track.track_id = track.id 
	where 
		user_track.user_id = user_id
		and not (track.id = ANY (skip))
	order by 
		 track.avd <-> cube(array[a,v,d]),
		 random() -- this makes this sequential scan, so will have to think of something better here
	 limit 1;
$$ language sql stable;


-- alter table track add column avd cube;
-- create index track_avd_idx on track using gist (avd);

-- update track 
-- set avd = subquery.avd
-- from (
-- select id, cube(array[arousal, valence, depth]) as avd from track 
-- where arousal is not null and valence is not null and depth is not null
-- ) as subquery
-- where track.id = subquery.id;
l
create or replace function set_avd_cube()
 returns trigger
 language plpgsql
as $$
begin
  new.avd := cube(array[new.arousal, new.valence, new.depth]);
  return new;
end;
$$;


drop trigger set_avd_value on track;
create trigger set_avd_value
before update on track 
for each row
execute procedure set_avd_cube();

drop trigger set_avd_value_insert on track;
create trigger set_avd_value_insert
before insert on track 
for each row
execute procedure set_avd_cube();