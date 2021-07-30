DO $$
BEGIN
    IF NOT EXISTS(
        SELECT
        FROM pg_catalog.pg_roles
        WHERE rolname = 'username'
    )
    THEN
        CREATE ROLE username WITH LOGIN PASSWORD 'password';
    END IF;
END;
$$;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

CREATE TABLE IF NOT EXISTS public.geodata
(
    id         SERIAL NOT NULL PRIMARY KEY,
    geom       GEOMETRY,
    properties JSONB NOT NULL DEFAULT '{}'::JSONB,
    created    TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
)
    WITH ( OIDS = FALSE )
    TABLESPACE pg_default;


CREATE TABLE IF NOT EXISTS public.zone
(
	id          SERIAL NOT NULL PRIMARY KEY,
	geohash     VARCHAR( 32 ) NOT NULL,
	image_id    VARCHAR( 512 ) NOT NULL,
	object_type VARCHAR( 512 ) NOT NULL,
	created     TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
)
    WITH ( OIDS = FALSE )
    TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.target_object
(
	id                 SERIAL NOT NULL PRIMARY KEY,
	object_name        VARCHAR( 512 ) NOT NULL,
	object_description VARCHAR( 512 ) NOT NULL,
	classification     VARCHAR( 512 ) NOT NULL DEFAULT 'UNCLASSIFIED'
)
    WITH ( OIDS = FALSE )
    TABLESPACE pg_default;

ALTER TABLE public.geodata       OWNER to username;
ALTER TABLE public.zone          OWNER to username;
ALTER TABLE public.target_object OWNER to username;

GRANT ALL PRIVILEGES ON DATABASE postgres to username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO username;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO username;
GRANT ALL ON SCHEMA public TO username;
