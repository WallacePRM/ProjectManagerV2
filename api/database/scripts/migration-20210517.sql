
CREATE TABLE users (
	id SERIAL PRIMARY KEY, 
	email VARCHAR(50) NOT NULL,
	password VARCHAR(30) NOT NULL
);

CREATE TABLE projects (
	id SERIAL PRIMARY KEY, 
	name VARCHAR(50) NOT NULL,
	description VARCHAR(100),
    time FLOAT NOT NULL,
	
	user_id INTEGER NOT NULL,
	
	FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tasks (
	id SERIAL PRIMARY KEY, 
	name VARCHAR(30) NOT NULL,
    time FLOAT NOT NULL,
	
    project_id INTEGER NOT NULL,
	user_id INTEGER NOT NULL,
	
	FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);