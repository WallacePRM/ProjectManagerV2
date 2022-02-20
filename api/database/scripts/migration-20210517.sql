
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	email VARCHAR(50) NOT NULL,
	password VARCHAR(70) NOT NULL
);

CREATE TABLE projects (
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL,
	description VARCHAR(100),
    estimated_time VARCHAR(10),
	price FLOAT,

	user_id INTEGER NOT NULL,

	FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tasks (
	id SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL,

    project_id INTEGER NOT NULL,
	user_id INTEGER NOT NULL,

	FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE history (
	id SERIAL PRIMARY KEY,
	action VARCHAR(5) NOT NULL,
	date TIMESTAMP NOT NULL,

	task_id INTEGER NOT NULL,

	FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE teams (
	id SERIAL PRIMARY KEY,
	name VARCHAR(60) NOT NULL,
	user_id INTEGER NOT NULL,

	FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE team_members (
	team_id INTEGER NOT NULL,
	user_id INTEGER NOT NULL,

	PRIMARY KEY (team_id, user_id),
	FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE team_projects (
	team_id INTEGER NOT NULL,
	project_id INTEGER NOT NULL,

	PRIMARY KEY (team_id, project_id),
	FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
	FOREIGN KEY (project_id) REFERENCES projects(id)
);