-- Create the emails table
CREATE TABLE emails (
    id BIGSERIAL PRIMARY KEY,
    recipient_name VARCHAR(255),
    recipient_email VARCHAR(255),
    company VARCHAR(255),
    subject VARCHAR(500),
    status VARCHAR(50) DEFAULT 'sent',
    date_sent DATE DEFAULT CURRENT_DATE,
    opened BOOLEAN DEFAULT FALSE,
    replied BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    followed_up BOOLEAN DEFAULT FALSE,
    linkedin VARCHAR(255)
);

-- Create an index for better performance
CREATE INDEX idx_emails_status ON emails(status);
CREATE INDEX idx_emails_date_sent ON emails(date_sent);

-- Enable Row Level Security
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (adjust as needed)
CREATE POLICY "Users can manage their own emails" ON emails
    FOR ALL USING (true);