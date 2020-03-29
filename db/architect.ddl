DROP TABLE IF EXISTS workspace CASCADE;
DROP TABLE IF EXISTS workspace_user CASCADE;

CREATE TABLE workspace(
    wid VARCHAR PRIMARY KEY,
    password VARCHAR NOT NULL);

CREATE TABLE workspace_user(
    wid VARCHAR REFERENCES workspace(wid) ON DELETE RESTRICT,
    uid VARCHAR NOT NULL,
    peer VARCHAR NOT NULL,
    PRIMARY KEY (wid, uid));
