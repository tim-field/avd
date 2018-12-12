-- drop table if exists track;
create table track (
	id text not null,
	user_id text not null, 
	arousal smallint not null default 0,
	valence smallint not null default 0,
	depth smallint not null default 0,
	last_heard_at timestamptz not null default current_timestamp,
	play_count int default 1,
	liked boolean not null, 
	"json" jsonb,
	primary key (id, user_id)
);
