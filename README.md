# api.wallet

CREATE TABLE users (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	firstname VARCHAR(50),
	lastname VARCHAR(50),
	email VARCHAR(150) UNIQUE NOT NULL,
	password_hash TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	is_active boolean NOT NULL DEFAULT TRUE,
	deleted_at TIMESTAMP
);

CREATE TABLE categories (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name VARCHAR(100) NOT NULL,
	user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  	created_at TIMESTAMP DEFAULT NOW(),
	is_active boolean NOT NULL DEFAULT TRUE,
	deleted_at TIMESTAMP
);

CREATE TABLE transactions (
  	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  	amount NUMERIC(10,2) NOT NULL,
  	type VARCHAR(10) CHECK (type IN ('income', 'expense')),
  	category_id UUID REFERENCES categories(id),
  	user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  	description TEXT,
  	date DATE NOT NULL,
  	created_at TIMESTAMP DEFAULT NOW(),
  	is_active boolean NOT NULL DEFAULT TRUE,
	deleted_at TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category_id);