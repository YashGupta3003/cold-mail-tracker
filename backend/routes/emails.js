const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get all emails
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('emails')
      .select('status, opened, replied');

    if (error) throw error;

    const stats = {
      total: data.length,
      sent: data.filter(email => email.status === 'sent').length,
      opened: data.filter(email => email.opened).length,
      replied: data.filter(email => email.replied).length,
      openRate: data.length > 0 ? 
        ((data.filter(email => email.opened).length / data.length) * 100).toFixed(1) : 
        0,
      replyRate: data.length > 0 ? 
        ((data.filter(email => email.replied).length / data.length) * 100).toFixed(1) : 
        0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Filter emails by status
router.get('/filter/:status', async (req, res) => {
  try {
    const { status } = req.params;
    
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error filtering emails:', error);
    res.status(500).json({ error: 'Failed to filter emails' });
  }
});

// Get email by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching email:', error);
    res.status(500).json({ error: 'Failed to fetch email' });
  }
});

// Create new email
router.post('/', async (req, res) => {
  try {
    const {
      recipient_name,
      recipient_email,
      company,
      subject,
      notes,
      follow_up_date,
      followed_up,
      linkedin
    } = req.body;

    // No required fields, all optional
    const emailData = {
      recipient_name,
      recipient_email,
      company,
      subject,
      notes,
      follow_up_date: follow_up_date === '' ? null : follow_up_date,
      status: 'sent',
      opened: false,
      replied: false,
      followed_up: !!followed_up,
      linkedin
    };

    const { data, error } = await supabase
      .from('emails')
      .insert([emailData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating email:', error);
    res.status(500).json({ error: 'Failed to create email' });
  }
});

// Update email
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date().toISOString() };
    if (updateData.follow_up_date === '') updateData.follow_up_date = null;
    // If linkedin is missing, set to null
    if (updateData.linkedin === undefined || updateData.linkedin === '') updateData.linkedin = null;

    const { data, error } = await supabase
      .from('emails')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ error: 'Failed to update email' });
  }
});

// Delete email
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('emails')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Email deleted successfully' });
  } catch (error) {
    console.error('Error deleting email:', error);
    res.status(500).json({ error: 'Failed to delete email' });
  }
});

module.exports = router;