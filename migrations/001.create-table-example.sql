BEGIN;

CREATE TABLE default$default.migration_example (
  ID INTEGER PRIMARY KEY,
  NAME TEXT NOT NULL
);

CREATE UNIQUE INDEX async_example_name_uniq ON default$default.migration_example (
  name
);

END;
