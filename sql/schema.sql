create table track (
	id text not null,
	arousal float null,
	valence float null,
	"depth" float null,
	play_count int null default 1,
	liked_count int null,
	"json" jsonb null,
	primary key (id)
);

create table "user" (
	id text not null,
	"json" jsonb null,
	primary key (id)
);

create table user_track (
	track_id text not null,
	user_id text not null, 
	arousal smallint,
	valence smallint,
	depth smallint,
	last_heard_at timestamptz not null default current_timestamp,
	play_count int default 1,
	liked boolean,
	primary key (track_id, user_id)
);

create table playlist (
	id text not null,
	user_id text not null,
	"name" text not null,
	arousal smallint[] not null default array[0, 0],
	valence smallint[] not null default array[0, 0],
	"depth" smallint[] not null default array[0, 0],
	"json" jsonb null,
	primary key (id, user_id)
);

