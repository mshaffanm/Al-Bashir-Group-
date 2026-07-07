/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, ClipboardList, RefreshCw, Loader2, Lock, KeyRound, ArrowRight } from 'lucide-react';
import CustomerSurvey from './CustomerSurvey';
import CRMDashboard from './CRMDashboard';
import { Survey, Question, Advisor } from './types';
import { supabase } from './supabaseClient';
// @ts-ignore
import alBashirLogo from './al_bashir_logo_1783064957865 (2).jpg';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'survey'>('dashboard');
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('crm_dashboard_auth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin' || password === 'bashir123') {
      setIsAuthenticated(true);
      localStorage.setItem('crm_dashboard_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Incorrect password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('crm_dashboard_auth');
    setPassword('');
  };

  const fetchSurveys = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    
    try {
      // Execute cloud queries concurrently across your Supabase tables
      const [surveysResult, questionsResult, advisorsResult] = await Promise.all([
        supabase.from('surveys').select('*').order('timestamp', { ascending: false }),
        supabase.from('questions').select('*'),
        supabase.from('advisors').select('*')
      ]);

      if (surveysResult.error || questionsResult.error || advisorsResult.error) {
        setError('Failed to load database from cloud server.');
        console.error({
          surveysError: surveysResult.error,
          questionsError: questionsResult.error,
          advisorsError: advisorsResult.error
        });
      } else {
        setSurveys(surveysResult.data || []);
        setQuestions(questionsResult.data || []);
        setAdvisors(advisorsResult.data || []);
      }
    } catch (err) {
      setError('Connection error. Cloud database may be unreachable.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleQuestionsUpdated = async () => {
    try {
      const { data, error } = await supabase.from('questions').select('*');
      if (!error && data) {
        setQuestions(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdvisorsUpdated = async () => {
    try {
      const { data, error } = await supabase.from('advisors').select('*');
      if (!error && data) {
        setAdvisors(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);