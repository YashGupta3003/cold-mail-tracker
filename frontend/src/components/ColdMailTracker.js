import React, { useState, useEffect } from 'react';
import { Plus, Mail, Eye, Reply, X, Calendar, User, Building, Target, TrendingUp, Clock, CheckCircle, Loader } from 'lucide-react';
import { emailsApi } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

const ColdMailTracker = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmail, setEditingEmail] = useState(null);
  const [newEmail, setNewEmail] = useState({
    recipient_name: '',
    recipient_email: '',
    company: '',
    subject: '',
    notes: '',
    follow_up_date: '',
    followed_up: false,
    linkedin: ''
  });
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    opened: 0,
    replied: 0,
    followed_up: 0,
    openRate: 0,
    replyRate: 0,
    followedUpRate: 0
  });

  // Load emails on component mount
  useEffect(() => {
    loadEmails();
    loadStats();
  }, []);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const response = await emailsApi.getAll();
      setEmails(response.data);
    } catch (error) {
      toast.error('Failed to load emails');
      console.error('Error loading emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await emailsApi.getAll();
      const data = response.data;
      const stats = {
        total: data.length,
        sent: data.filter(email => email.status === 'sent').length,
        opened: data.filter(email => email.opened).length,
        replied: data.filter(email => email.replied).length,
        followed_up: data.filter(email => email.followed_up).length,
        openRate: data.length > 0 ? ((data.filter(email => email.opened).length / data.length) * 100).toFixed(1) : 0,
        replyRate: data.length > 0 ? ((data.filter(email => email.replied).length / data.length) * 100).toFixed(1) : 0,
        followedUpRate: data.length > 0 ? ((data.filter(email => email.followed_up).length / data.length) * 100).toFixed(1) : 0
      };
      setStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAddEmail = async () => {
    try {
      if (editingEmail) {
        await emailsApi.update(editingEmail.id, newEmail);
        toast.success('Email updated successfully!');
      } else {
        await emailsApi.create(newEmail);
        toast.success('Email added successfully!');
      }
      await loadEmails();
      await loadStats();
      resetForm();
    } catch (error) {
      toast.error('Failed to save email');
      console.error('Error saving email:', error);
    }
  };

  const resetForm = () => {
    setNewEmail({
      recipient_name: '',
      recipient_email: '',
      company: '',
      subject: '',
      notes: '',
      follow_up_date: '',
      followed_up: false,
      linkedin: ''
    });
    setEditingEmail(null);
    setShowForm(false);
  };

  const editEmail = (email) => {
    setEditingEmail(email);
    setNewEmail({
      recipient_name: email.recipient_name || '',
      recipient_email: email.recipient_email || '',
      company: email.company || '',
      subject: email.subject || '',
      notes: email.notes || '',
      follow_up_date: email.follow_up_date || '',
      followed_up: email.followed_up || false,
      linkedin: email.linkedin || ''
    });
    setShowForm(true);
  };

  const updateEmailStatus = async (id, updates) => {
    try {
      await emailsApi.update(id, updates);
      await loadEmails();
      await loadStats();
      toast.success('Email status updated!');
    } catch (error) {
      toast.error('Failed to update email status');
      console.error('Error updating email:', error);
    }
  };

  const deleteEmail = async (id) => {
    if (window.confirm('Are you sure you want to delete this email?')) {
      try {
        await emailsApi.delete(id);
        await loadEmails();
        await loadStats();
        toast.success('Email deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete email');
        console.error('Error deleting email:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'opened': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'followed-up': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtered emails by status with correct precedence
  const filteredEmails = emails.filter(email => {
    if (filter === 'all') return true;
    if (filter === 'replied') return email.replied;
    if (filter === 'followed-up') return !email.replied && email.followed_up;
    if (filter === 'opened') return !email.replied && !email.followed_up && email.opened;
    if (filter === 'sent') return !email.replied && !email.followed_up && !email.opened;
    return email.status === filter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Toaster position="top-right" />
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Cold Mail Tracker
          </h1>
          <p className="text-gray-600 text-lg">Track your outreach campaigns with style</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Target className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Opened</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.opened}</p>
              </div>
              <Eye className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Replied</p>
                <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
              </div>
              <Reply className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Followed Up</p>
                <p className="text-2xl font-bold text-orange-600">{stats.followed_up}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats.openRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reply Rate</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.replyRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Followed Up Rate</p>
                <p className="text-2xl font-bold text-orange-600">{stats.followedUpRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'sent', 'opened', 'replied', 'followed-up'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === status
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Email
          </button>
        </div>

        {/* Add/Edit Email Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingEmail ? 'Edit Email' : 'Add New Email'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Name</label>
                  <input
                    type="text"
                    value={newEmail.recipient_name}
                    onChange={(e) => setNewEmail({...newEmail, recipient_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={newEmail.recipient_email}
                    onChange={(e) => setNewEmail({...newEmail, recipient_email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={newEmail.company}
                    onChange={(e) => setNewEmail({...newEmail, company: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Company Inc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={newEmail.subject}
                    onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Partnership Opportunity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                  <input
                    type="date"
                    value={newEmail.follow_up_date}
                    onChange={(e) => setNewEmail({...newEmail, follow_up_date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={newEmail.linkedin}
                    onChange={(e) => setNewEmail({...newEmail, linkedin: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={newEmail.notes}
                    onChange={(e) => setNewEmail({...newEmail, notes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="3"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddEmail}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  {editingEmail ? 'Update Email' : 'Add Email'}
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email List */}
        <div className="space-y-4">
          {filteredEmails.map(email => (
            <div key={email.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{email.subject}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{email.recipient_name}</span>
                        </div>
                        {email.company && (
                          <div className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            <span>{email.company}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(email.date_sent)}</span>
                        </div>
                        {email.linkedin && (
                          <div className="flex items-center gap-1">
                            <a
                              href={email.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              LinkedIn
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}>
                      {email.status.charAt(0).toUpperCase() + email.status.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{email.recipient_email}</p>
                  {email.notes && (
                    <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mb-3">{email.notes}</p>
                  )}
                  {email.follow_up_date && (
                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <Clock className="w-4 h-4" />
                      <span>Follow up: {formatDate(email.follow_up_date)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => editEmail(email)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-all"
                  >
                    Edit
                  </button>
                  
                  <button
                    onClick={() => updateEmailStatus(email.id, {
                      opened: !email.opened,
                      status: !email.opened
                        ? (email.replied ? 'replied' : email.followed_up ? 'followed-up' : 'opened')
                        : (email.replied ? 'replied' : email.followed_up ? 'followed-up' : 'sent')
                    })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      email.opened
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-800'
                    }`}
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    {email.opened ? 'Opened' : 'Mark Opened'}
                  </button>
                  <button
                    onClick={() => updateEmailStatus(email.id, {
                      followed_up: !email.followed_up,
                      status: !email.followed_up
                        ? (email.replied ? 'replied' : 'followed-up')
                        : (email.replied ? 'replied' : email.opened ? 'opened' : 'sent')
                    })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      email.followed_up
                        ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-800'
                    }`}
                  >
                    <Clock className="w-4 h-4 inline mr-1" />
                    {email.followed_up ? 'Followed Up' : 'Mark Followed Up'}
                  </button>
                  <button
                    onClick={() => updateEmailStatus(email.id, {
                      replied: !email.replied,
                      status: !email.replied
                        ? (email.followed_up ? 'followed-up' : email.opened ? 'opened' : 'sent')
                        : 'replied'
                    })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      email.replied
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-800'
                    }`}
                  >
                    <Reply className="w-4 h-4 inline mr-1" />
                    {email.replied ? 'Replied' : 'Mark Replied'}
                  </button>
                  <button
                    onClick={() => deleteEmail(email.id)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-all"
                  >
                    <X className="w-4 h-4 inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredEmails.length === 0 && (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-500 mb-2">No emails found</h3>
              <p className="text-gray-400">
                {filter === 'all' 
                  ? 'Start by adding your first cold email campaign'
                  : `No emails with status "${filter}" found`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColdMailTracker;