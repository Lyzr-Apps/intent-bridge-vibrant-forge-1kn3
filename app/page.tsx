'use client'

import React, { useState } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { FiSearch, FiUsers, FiDatabase, FiChevronDown, FiChevronUp, FiExternalLink, FiTarget, FiBookOpen, FiLayers, FiArrowRight, FiUser, FiAlertCircle, FiZap, FiLoader } from 'react-icons/fi'

// ============================================================
// TYPES
// ============================================================

interface MatchItem {
  name: string
  title_or_role: string
  compatibility_score: number
  reasoning: string
  contextual_summary: string
  shared_interests: string[]
  next_steps: string[]
  confidence_level: string
}

interface MatchOrchestratorResult {
  matches: MatchItem[]
  intent_summary: string
  overall_analysis: string
  total_matches: number
}

interface DatasetItem {
  title: string
  source: string
  source_type: string
  relevance_score: number
  contextual_summary: string
  methodology_notes: string
  access_link: string
  next_steps: string[]
  year: string
  authors: string[]
}

interface DatasetDiscoveryResult {
  datasets: DatasetItem[]
  research_landscape_summary: string
  total_results: number
  search_metadata: {
    query_used: string
    sources_searched: string[]
    filters_applied: string
  }
}

// ============================================================
// CONSTANTS
// ============================================================

const MATCH_ORCHESTRATOR_ID = '699ada8321096e9c61f06e1a'
const DATASET_DISCOVERY_ID = '699ada9932558c5716f1d41f'

const AGENTS = [
  { id: MATCH_ORCHESTRATOR_ID, name: 'Match Orchestrator Manager', purpose: 'Coordinates intent analysis and compatibility matching' },
  { id: '699ada6221096e9c61f06e16', name: 'Intent Analyzer Agent', purpose: 'Analyzes user intent (sub-agent)' },
  { id: '699ada6281cd1b955343e301', name: 'Compatibility Matcher Agent', purpose: 'Scores compatibility (sub-agent)' },
  { id: DATASET_DISCOVERY_ID, name: 'Dataset Discovery Agent', purpose: 'Finds relevant research datasets' },
]

const DOMAIN_OPTIONS = ['Computer Science', 'Physics', 'Biology', 'Mathematics', 'Economics', 'Medicine', 'Engineering', 'Other']
const DATA_TYPE_OPTIONS = ['All Types', 'Dataset', 'Paper', 'Survey', 'Benchmark']

// ============================================================
// SAMPLE DATA
// ============================================================

const SAMPLE_MATCH_FORM = {
  name: 'Dr. Sarah Chen',
  bio: 'AI researcher with 10 years of experience in NLP and deep learning. Published 30+ papers in top-tier conferences. Passionate about ethical AI and building inclusive technology.',
  preferences: 'Collaborative researchers, interdisciplinary projects, open-source advocates',
  intent: 'Looking for co-investigators for a new project on bias detection in large language models, and potential industry partners for real-world applications.'
}

const SAMPLE_RESEARCH_FORM = {
  topic: 'Transformer architectures for multimodal learning',
  domain: 'Computer Science',
  dataType: 'All Types',
  yearFrom: '2020',
  yearTo: '2025'
}

const SAMPLE_MATCHES: MatchOrchestratorResult = {
  matches: [
    {
      name: 'Dr. Alex Rivera',
      title_or_role: 'Senior Research Scientist at Google DeepMind',
      compatibility_score: 92,
      reasoning: 'Strong overlap in NLP research interests with complementary expertise in model interpretability. Dr. Rivera has published extensively on bias metrics and fairness in language models, making them an ideal collaborator for the proposed bias detection project.',
      contextual_summary: 'Leading expert in AI fairness with hands-on LLM experience and industry connections.',
      shared_interests: ['NLP', 'Bias Detection', 'Ethical AI', 'Open Source', 'Deep Learning'],
      next_steps: ['Schedule an introductory call', 'Share recent publications', 'Explore joint grant opportunities'],
      confidence_level: 'High'
    },
    {
      name: 'Prof. Maria Gonzalez',
      title_or_role: 'Associate Professor, MIT CSAIL',
      compatibility_score: 85,
      reasoning: 'Extensive background in interdisciplinary AI research spanning linguistics and computer science. Currently leading a lab focused on inclusive NLP technologies, which aligns well with the ethical AI focus.',
      contextual_summary: 'Academic leader in inclusive NLP with strong publication record and grant funding.',
      shared_interests: ['Interdisciplinary Research', 'NLP', 'Inclusive Technology', 'Academic Publishing'],
      next_steps: ['Review her recent EMNLP paper', 'Reach out via academic network', 'Propose a workshop collaboration'],
      confidence_level: 'High'
    },
    {
      name: 'James Park',
      title_or_role: 'VP of AI Ethics, Anthropic',
      compatibility_score: 78,
      reasoning: 'Industry leader focused on responsible AI deployment. While not a traditional researcher, his position offers unique access to real-world LLM bias data and industry-scale testing environments.',
      contextual_summary: 'Industry executive bridging the gap between AI research and responsible deployment.',
      shared_interests: ['Ethical AI', 'LLM Applications', 'Industry-Academia Collaboration'],
      next_steps: ['Connect via LinkedIn', 'Propose a data sharing agreement', 'Explore sponsored research programs'],
      confidence_level: 'Medium'
    },
    {
      name: 'Dr. Priya Sharma',
      title_or_role: 'Postdoctoral Fellow, Stanford HAI',
      compatibility_score: 71,
      reasoning: 'Emerging researcher with fresh perspectives on bias detection methodologies. Recent dissertation focused on cross-lingual bias patterns, offering a unique angle for the proposed project.',
      contextual_summary: 'Early-career researcher bringing novel cross-lingual bias detection approaches.',
      shared_interests: ['Bias Detection', 'Cross-lingual NLP', 'Open Source'],
      next_steps: ['Invite to join the research team', 'Review dissertation findings', 'Discuss postdoc collaboration'],
      confidence_level: 'Medium'
    }
  ],
  intent_summary: 'The user seeks collaborative partners for bias detection research in LLMs, emphasizing interdisciplinary collaboration and real-world application through industry partnerships.',
  overall_analysis: 'Strong matches found across academia and industry. The profile indicates a well-established researcher with clear goals, enabling high-confidence recommendations. Priority matches combine complementary skills in fairness, NLP, and ethics.',
  total_matches: 4
}

const SAMPLE_DATASETS: DatasetDiscoveryResult = {
  datasets: [
    {
      title: 'Vision-Language Transformer Benchmark Suite (VL-TBS)',
      source: 'arXiv:2401.12345',
      source_type: 'Benchmark',
      relevance_score: 94,
      contextual_summary: 'Comprehensive benchmark suite for evaluating multimodal transformers across 15 vision-language tasks. Includes standardized evaluation metrics and baseline results for CLIP, BLIP-2, and LLaVA architectures.',
      methodology_notes: 'Uses stratified sampling across task difficulty levels. Includes both zero-shot and fine-tuned evaluation protocols with reproducibility guarantees.',
      access_link: 'https://arxiv.org/abs/2401.12345',
      next_steps: ['Download evaluation scripts from GitHub', 'Run baselines on your hardware', 'Compare with your architecture'],
      year: '2024',
      authors: ['Zhang, W.', 'Liu, K.', 'Patel, R.']
    },
    {
      title: 'MultiModal Fusion Architectures: A Survey',
      source: 'ACM Computing Surveys',
      source_type: 'Survey',
      relevance_score: 88,
      contextual_summary: 'Exhaustive survey covering 200+ papers on multimodal fusion strategies in transformer architectures. Categorizes approaches into early, late, and hybrid fusion with performance comparisons.',
      methodology_notes: 'Systematic literature review following PRISMA guidelines. Covers publications from 2020-2024 with quantitative meta-analysis of reported results.',
      access_link: 'https://dl.acm.org/doi/example',
      next_steps: ['Use taxonomy to position your work', 'Identify research gaps', 'Follow cited architectures'],
      year: '2024',
      authors: ['Chen, A.', 'Williams, B.', 'Kumar, S.', 'Davis, T.']
    },
    {
      title: 'CrossModal-3M: 3 Million Aligned Image-Text-Audio Triplets',
      source: 'HuggingFace Datasets',
      source_type: 'Dataset',
      relevance_score: 82,
      contextual_summary: 'Large-scale dataset of aligned image, text, and audio triplets collected from educational content. Designed for training and evaluating multimodal transformers on three-way alignment tasks.',
      methodology_notes: 'Web-scraped with automated quality filtering. Human validation on 10% sample shows 94% alignment accuracy.',
      access_link: 'https://huggingface.co/datasets/example',
      next_steps: ['Download a subset for prototyping', 'Validate quality for your use case', 'Consider augmentation strategies'],
      year: '2023',
      authors: ['Thompson, L.', 'Garcia, M.']
    }
  ],
  research_landscape_summary: 'The field of multimodal transformer architectures is rapidly evolving with significant advances in 2023-2024. Key trends include unified architectures that handle multiple modalities through shared attention mechanisms, efficient fusion strategies that reduce computational cost, and scaling laws specific to multimodal learning.',
  total_results: 3,
  search_metadata: {
    query_used: 'Transformer architectures for multimodal learning',
    sources_searched: ['arXiv', 'ACM Digital Library', 'HuggingFace', 'Semantic Scholar'],
    filters_applied: 'Domain: Computer Science, Years: 2020-2025, Types: All'
  }
}

// ============================================================
// HELPERS
// ============================================================

function parseAgentResult(result: any): any {
  if (!result) return null

  if (result?.response?.result && typeof result.response.result === 'object' && !Array.isArray(result.response.result)) {
    const r = result.response.result
    if (r.matches || r.datasets) return r
  }

  if (result?.response?.result && typeof result.response.result === 'string') {
    try {
      const parsed = JSON.parse(result.response.result)
      return parsed
    } catch {
      const match = result.response.result.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
      if (match) {
        try { return JSON.parse(match[1]) } catch { /* noop */ }
      }
    }
  }

  if (result?.response && (result.response.matches || result.response.datasets)) {
    return result.response
  }

  if (result?.matches || result?.datasets) {
    return result
  }

  if (result?.response?.message && typeof result.response.message === 'string') {
    try {
      return JSON.parse(result.response.message)
    } catch { /* noop */ }
  }

  if (result?.raw_response && typeof result.raw_response === 'string') {
    try {
      const parsed = JSON.parse(result.raw_response)
      return parseAgentResult({ response: { result: parsed } })
    } catch { /* noop */ }
  }

  return result?.response?.result || null
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-200'
  if (score >= 60) return 'bg-amber-100 text-amber-800 border-amber-200'
  return 'bg-red-100 text-red-800 border-red-200'
}

function getScoreBgGradient(score: number): string {
  if (score >= 80) return 'from-green-500 to-emerald-600'
  if (score >= 60) return 'from-amber-500 to-orange-600'
  return 'from-red-500 to-rose-600'
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.split(' ').filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function getAvatarColor(name: string): string {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-sky-600',
  ]
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

// ============================================================
// INLINE COMPONENTS
// ============================================================

function SkeletonMatchCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl bg-card border border-border p-6 shadow-md animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-48 bg-muted rounded" />
            </div>
            <div className="h-6 w-16 bg-muted rounded-full" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-3/4 bg-muted rounded" />
          </div>
          <div className="mt-4 flex gap-2">
            <div className="h-5 w-16 bg-muted rounded-full" />
            <div className="h-5 w-20 bg-muted rounded-full" />
            <div className="h-5 w-14 bg-muted rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SkeletonDatasetCards() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl bg-card border border-border p-6 shadow-md animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-64 bg-muted rounded" />
              <div className="h-3 w-48 bg-muted rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-muted rounded-full" />
              <div className="h-6 w-14 bg-muted rounded-full" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-5/6 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function MatchCard({ match, isExpanded, onToggle }: { match: MatchItem; isExpanded: boolean; onToggle: () => void }) {
  const interests = Array.isArray(match?.shared_interests) ? match.shared_interests : []
  const nextSteps = Array.isArray(match?.next_steps) ? match.next_steps : []
  const score = match?.compatibility_score ?? 0

  return (
    <div className="rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <button onClick={onToggle} className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(match?.name ?? '')} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {getInitials(match?.name ?? '')}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base truncate">{match?.name ?? 'Unknown'}</h3>
            <p className="text-muted-foreground text-sm truncate">{match?.title_or_role ?? ''}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getScoreColor(score)}`}>
              <FiTarget className="w-3 h-3 mr-1" />
              {score}%
            </span>
            {isExpanded ? <FiChevronUp className="w-4 h-4 text-muted-foreground" /> : <FiChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{match?.contextual_summary ?? ''}</p>

        {interests.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {interests.slice(0, 4).map((interest, idx) => (
              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {interest}
              </span>
            ))}
            {interests.length > 4 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                +{interests.length - 4} more
              </span>
            )}
          </div>
        )}

        {match?.confidence_level && (
          <div className="mt-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${match.confidence_level === 'High' ? 'bg-purple-100 text-purple-800' : match.confidence_level === 'Medium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
              {match.confidence_level} Confidence
            </span>
          </div>
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 pt-0 border-t border-border mt-0 space-y-4">
          <div className="pt-4">
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <FiBookOpen className="w-4 h-4 text-primary" />
              Reasoning
            </h4>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {renderMarkdown(match?.reasoning ?? '')}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <FiTarget className="w-4 h-4 text-primary" />
              Contextual Summary
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{match?.contextual_summary ?? ''}</p>
          </div>

          {interests.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <FiLayers className="w-4 h-4 text-primary" />
                Shared Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {nextSteps.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <FiArrowRight className="w-4 h-4 text-primary" />
                Next Steps
              </h4>
              <ul className="space-y-1.5">
                {nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${getScoreBgGradient(score)} text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}>
                      {idx + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DatasetCard({ dataset, isExpanded, onToggle }: { dataset: DatasetItem; isExpanded: boolean; onToggle: () => void }) {
  const nextSteps = Array.isArray(dataset?.next_steps) ? dataset.next_steps : []
  const authors = Array.isArray(dataset?.authors) ? dataset.authors : []
  const score = dataset?.relevance_score ?? 0

  return (
    <div className="rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <button onClick={onToggle} className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base">{dataset?.title ?? 'Untitled'}</h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {dataset?.year && <span>{dataset.year}</span>}
              {authors.length > 0 && (
                <span className="truncate max-w-xs">
                  {authors.length <= 2 ? authors.join(', ') : `${authors[0]} et al.`}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {dataset?.source_type && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wide">
                {dataset.source_type}
              </span>
            )}
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getScoreColor(score)}`}>
              {score}%
            </span>
            {isExpanded ? <FiChevronUp className="w-4 h-4 text-muted-foreground" /> : <FiChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{dataset?.contextual_summary ?? ''}</p>

        {dataset?.source && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
              <FiDatabase className="w-3 h-3" />
              {dataset.source}
            </span>
          </div>
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 pt-0 border-t border-border mt-0 space-y-4">
          <div className="pt-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">Full Summary</h4>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {renderMarkdown(dataset?.contextual_summary ?? '')}
            </div>
          </div>

          {dataset?.methodology_notes && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Methodology Notes</h4>
              <div className="text-sm text-muted-foreground leading-relaxed bg-secondary/50 rounded-lg p-3">
                {renderMarkdown(dataset.methodology_notes)}
              </div>
            </div>
          )}

          {dataset?.access_link && (
            <div>
              <a href={dataset.access_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                <FiExternalLink className="w-4 h-4" />
                Access Resource
              </a>
            </div>
          )}

          {nextSteps.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <FiArrowRight className="w-4 h-4 text-primary" />
                Recommended Next Steps
              </h4>
              <ul className="space-y-1.5">
                {nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {authors.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <FiUser className="w-4 h-4 text-primary" />
                Authors
              </h4>
              <div className="flex flex-wrap gap-2">
                {authors.map((author, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {author}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// ERROR BOUNDARY
// ============================================================

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function Page() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'match' | 'research'>('match')

  // Sample data toggle
  const [showSampleData, setShowSampleData] = useState(false)

  // Active agent tracking
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  // ---- MindMatch State ----
  const [matchForm, setMatchForm] = useState({ name: '', bio: '', preferences: '', intent: '' })
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchError, setMatchError] = useState<string | null>(null)
  const [matchResults, setMatchResults] = useState<MatchOrchestratorResult | null>(null)
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null)
  const [matchFormErrors, setMatchFormErrors] = useState<Record<string, boolean>>({})

  // ---- Research State ----
  const [researchForm, setResearchForm] = useState({ topic: '', domain: 'Computer Science', dataType: 'All Types', yearFrom: '', yearTo: '' })
  const [researchLoading, setResearchLoading] = useState(false)
  const [researchError, setResearchError] = useState<string | null>(null)
  const [researchResults, setResearchResults] = useState<DatasetDiscoveryResult | null>(null)
  const [expandedDatasetId, setExpandedDatasetId] = useState<number | null>(null)
  const [researchFormErrors, setResearchFormErrors] = useState<Record<string, boolean>>({})

  // ---- Handlers ----

  const handleFindMatches = async () => {
    const formData = showSampleData ? SAMPLE_MATCH_FORM : matchForm
    const errors: Record<string, boolean> = {}
    if (!formData.name.trim()) errors.name = true
    if (!formData.bio.trim()) errors.bio = true
    if (!formData.intent.trim()) errors.intent = true

    if (Object.keys(errors).length > 0) {
      setMatchFormErrors(errors)
      return
    }
    setMatchFormErrors({})

    if (showSampleData) {
      setMatchResults(SAMPLE_MATCHES)
      return
    }

    setMatchLoading(true)
    setMatchError(null)
    setMatchResults(null)
    setExpandedMatchId(null)
    setActiveAgentId(MATCH_ORCHESTRATOR_ID)

    try {
      const message = `Find compatible matches for this profile:\nName: ${formData.name}\nBio: ${formData.bio}\nKey Preferences: ${formData.preferences || 'Not specified'}\nMatching Intent: ${formData.intent}`
      const result = await callAIAgent(message, MATCH_ORCHESTRATOR_ID)

      if (result.success) {
        const parsed = parseAgentResult(result)
        if (parsed) {
          const data: MatchOrchestratorResult = {
            matches: Array.isArray(parsed?.matches) ? parsed.matches : [],
            intent_summary: parsed?.intent_summary ?? '',
            overall_analysis: parsed?.overall_analysis ?? '',
            total_matches: parsed?.total_matches ?? 0,
          }
          setMatchResults(data)
        } else {
          setMatchError('Could not parse the response from the agent. Please try again.')
        }
      } else {
        setMatchError(result?.error ?? 'An error occurred while finding matches. Please try again.')
      }
    } catch (err) {
      setMatchError('Network error. Please check your connection and try again.')
    } finally {
      setMatchLoading(false)
      setActiveAgentId(null)
    }
  }

  const handleDiscoverDatasets = async () => {
    const formData = showSampleData ? SAMPLE_RESEARCH_FORM : researchForm
    const errors: Record<string, boolean> = {}
    if (!formData.topic.trim()) errors.topic = true

    if (Object.keys(errors).length > 0) {
      setResearchFormErrors(errors)
      return
    }
    setResearchFormErrors({})

    if (showSampleData) {
      setResearchResults(SAMPLE_DATASETS)
      return
    }

    setResearchLoading(true)
    setResearchError(null)
    setResearchResults(null)
    setExpandedDatasetId(null)
    setActiveAgentId(DATASET_DISCOVERY_ID)

    try {
      let message = `Discover relevant datasets for:\nResearch Topic: ${formData.topic}\nDomain: ${formData.domain}`
      if (formData.dataType !== 'All Types') message += `\nData Type: ${formData.dataType}`
      if (formData.yearFrom || formData.yearTo) message += `\nYear Range: ${formData.yearFrom || 'any'} - ${formData.yearTo || 'present'}`

      const result = await callAIAgent(message, DATASET_DISCOVERY_ID)

      if (result.success) {
        const parsed = parseAgentResult(result)
        if (parsed) {
          const data: DatasetDiscoveryResult = {
            datasets: Array.isArray(parsed?.datasets) ? parsed.datasets : [],
            research_landscape_summary: parsed?.research_landscape_summary ?? '',
            total_results: parsed?.total_results ?? 0,
            search_metadata: {
              query_used: parsed?.search_metadata?.query_used ?? '',
              sources_searched: Array.isArray(parsed?.search_metadata?.sources_searched) ? parsed.search_metadata.sources_searched : [],
              filters_applied: parsed?.search_metadata?.filters_applied ?? '',
            },
          }
          setResearchResults(data)
        } else {
          setResearchError('Could not parse the response from the agent. Please try again.')
        }
      } else {
        setResearchError(result?.error ?? 'An error occurred while discovering datasets. Please try again.')
      }
    } catch (err) {
      setResearchError('Network error. Please check your connection and try again.')
    } finally {
      setResearchLoading(false)
      setActiveAgentId(null)
    }
  }

  // Current form data for display (accounts for sample data toggle)
  const currentMatchForm = showSampleData ? SAMPLE_MATCH_FORM : matchForm
  const currentResearchForm = showSampleData ? SAMPLE_RESEARCH_FORM : researchForm

  const currentMatchResults = showSampleData && !matchResults ? null : matchResults
  const currentResearchResults = showSampleData && !researchResults ? null : researchResults

  const matches = Array.isArray(currentMatchResults?.matches) ? currentMatchResults.matches : []
  const datasets = Array.isArray(currentResearchResults?.datasets) ? currentResearchResults.datasets : []

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground">
        {/* ============ TOP NAV ============ */}
        <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo + Name */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <FiZap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground hidden sm:block">MindMatch Intelligence Hub</span>
              <span className="font-bold text-lg tracking-tight text-foreground sm:hidden">MindMatch</span>
            </div>

            {/* Tab Selectors */}
            <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
              <button onClick={() => setActiveTab('match')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'match' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                <FiUsers className="w-4 h-4" />
                <span className="hidden sm:inline">MindMatch</span>
              </button>
              <button onClick={() => setActiveTab('research')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'research' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                <FiBookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Research Discovery</span>
              </button>
            </div>

            {/* Sample Data Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">Sample Data</span>
              <button onClick={() => setShowSampleData(prev => !prev)} className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${showSampleData ? 'bg-primary' : 'bg-muted'}`} aria-label="Toggle sample data">
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${showSampleData ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </nav>

        {/* ============ MAIN CONTENT ============ */}
        <main className="max-w-6xl mx-auto px-4 py-8">

          {/* ============ MINDMATCH TAB ============ */}
          {activeTab === 'match' && (
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Find Compatible Matches</h1>
                <p className="text-muted-foreground text-sm mt-1">Enter your profile details to discover compatible connections powered by AI analysis.</p>
              </div>

              {/* Form */}
              <div className="rounded-xl bg-card border border-border shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1">
                      <FiUser className="w-3.5 h-3.5 text-primary" />
                      Name <span className="text-destructive">*</span>
                    </label>
                    <input type="text" placeholder="Your full name" value={currentMatchForm.name} onChange={(e) => { setMatchForm(prev => ({ ...prev, name: e.target.value })); setMatchFormErrors(prev => ({ ...prev, name: false })) }} className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${matchFormErrors.name ? 'border-destructive ring-1 ring-destructive' : 'border-border'}`} readOnly={showSampleData} />
                    {matchFormErrors.name && <p className="text-xs text-destructive">Name is required</p>}
                  </div>

                  {/* Preferences */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1">
                      <FiLayers className="w-3.5 h-3.5 text-primary" />
                      Key Preferences
                    </label>
                    <input type="text" placeholder="e.g., collaborative, open-source, interdisciplinary" value={currentMatchForm.preferences} onChange={(e) => setMatchForm(prev => ({ ...prev, preferences: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" readOnly={showSampleData} />
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1">
                      <FiBookOpen className="w-3.5 h-3.5 text-primary" />
                      Bio / Description <span className="text-destructive">*</span>
                    </label>
                    <textarea placeholder="Tell us about yourself, your background, experience, and expertise..." rows={3} value={currentMatchForm.bio} onChange={(e) => { setMatchForm(prev => ({ ...prev, bio: e.target.value })); setMatchFormErrors(prev => ({ ...prev, bio: false })) }} className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none ${matchFormErrors.bio ? 'border-destructive ring-1 ring-destructive' : 'border-border'}`} readOnly={showSampleData} />
                    {matchFormErrors.bio && <p className="text-xs text-destructive">Bio is required</p>}
                  </div>

                  {/* Intent */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1">
                      <FiTarget className="w-3.5 h-3.5 text-primary" />
                      Matching Intent / Goals <span className="text-destructive">*</span>
                    </label>
                    <textarea placeholder="What are you looking for? Describe your matching goals..." rows={3} value={currentMatchForm.intent} onChange={(e) => { setMatchForm(prev => ({ ...prev, intent: e.target.value })); setMatchFormErrors(prev => ({ ...prev, intent: false })) }} className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none ${matchFormErrors.intent ? 'border-destructive ring-1 ring-destructive' : 'border-border'}`} readOnly={showSampleData} />
                    {matchFormErrors.intent && <p className="text-xs text-destructive">Matching intent is required</p>}
                  </div>
                </div>

                {/* Submit */}
                <div className="mt-6 flex justify-end">
                  <button onClick={handleFindMatches} disabled={matchLoading} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20">
                    {matchLoading ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FiSearch className="w-4 h-4" />
                        Find Matches
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {matchError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Error Finding Matches</p>
                    <p className="text-sm text-destructive/80 mt-1">{matchError}</p>
                  </div>
                  <button onClick={handleFindMatches} className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition-opacity">
                    Try Again
                  </button>
                </div>
              )}

              {/* Loading */}
              {matchLoading && <SkeletonMatchCards />}

              {/* Results */}
              {!matchLoading && matches.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">
                      Match Results
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({currentMatchResults?.total_matches ?? matches.length} found)
                      </span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {matches.map((match, idx) => (
                      <MatchCard key={idx} match={match} isExpanded={expandedMatchId === idx} onToggle={() => setExpandedMatchId(expandedMatchId === idx ? null : idx)} />
                    ))}
                  </div>

                  {/* Intent Summary + Overall Analysis */}
                  {(currentMatchResults?.intent_summary || currentMatchResults?.overall_analysis) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentMatchResults?.intent_summary && (
                        <div className="rounded-xl bg-card border border-border shadow-md p-6">
                          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <FiTarget className="w-4 h-4 text-primary" />
                            Intent Summary
                          </h3>
                          <div className="text-sm text-muted-foreground leading-relaxed">
                            {renderMarkdown(currentMatchResults.intent_summary)}
                          </div>
                        </div>
                      )}
                      {currentMatchResults?.overall_analysis && (
                        <div className="rounded-xl bg-card border border-border shadow-md p-6">
                          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <FiBookOpen className="w-4 h-4 text-primary" />
                            Overall Analysis
                          </h3>
                          <div className="text-sm text-muted-foreground leading-relaxed">
                            {renderMarkdown(currentMatchResults.overall_analysis)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!matchLoading && !matchError && matches.length === 0 && !currentMatchResults && (
                <div className="rounded-xl bg-card border border-border shadow-md p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto flex items-center justify-center mb-4">
                    <FiUsers className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">No Matches Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Enter your profile details above and click &quot;Find Matches&quot; to discover compatible connections.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ============ RESEARCH DISCOVERY TAB ============ */}
          {activeTab === 'research' && (
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Research Discovery</h1>
                <p className="text-muted-foreground text-sm mt-1">Find relevant datasets, papers, and benchmarks for your research topic.</p>
              </div>

              {/* Form */}
              <div className="rounded-xl bg-card border border-border shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Research Topic */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1">
                      <FiSearch className="w-3.5 h-3.5 text-primary" />
                      Research Topic / Description <span className="text-destructive">*</span>
                    </label>
                    <input type="text" placeholder="e.g., Transformer architectures for multimodal learning" value={currentResearchForm.topic} onChange={(e) => { setResearchForm(prev => ({ ...prev, topic: e.target.value })); setResearchFormErrors(prev => ({ ...prev, topic: false })) }} className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${researchFormErrors.topic ? 'border-destructive ring-1 ring-destructive' : 'border-border'}`} readOnly={showSampleData} />
                    {researchFormErrors.topic && <p className="text-xs text-destructive">Research topic is required</p>}
                  </div>

                  {/* Domain */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1">
                      <FiDatabase className="w-3.5 h-3.5 text-primary" />
                      Domain
                    </label>
                    <select value={currentResearchForm.domain} onChange={(e) => setResearchForm(prev => ({ ...prev, domain: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none cursor-pointer" disabled={showSampleData}>
                      {DOMAIN_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Data Type */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1">
                      <FiLayers className="w-3.5 h-3.5 text-primary" />
                      Data Type
                    </label>
                    <select value={currentResearchForm.dataType} onChange={(e) => setResearchForm(prev => ({ ...prev, dataType: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none cursor-pointer" disabled={showSampleData}>
                      {DATA_TYPE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Year Range */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">From Year</label>
                    <input type="text" placeholder="e.g., 2020" value={currentResearchForm.yearFrom} onChange={(e) => setResearchForm(prev => ({ ...prev, yearFrom: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" readOnly={showSampleData} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">To Year</label>
                    <input type="text" placeholder="e.g., 2025" value={currentResearchForm.yearTo} onChange={(e) => setResearchForm(prev => ({ ...prev, yearTo: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" readOnly={showSampleData} />
                  </div>
                </div>

                {/* Submit */}
                <div className="mt-6 flex justify-end">
                  <button onClick={handleDiscoverDatasets} disabled={researchLoading} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20">
                    {researchLoading ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <FiSearch className="w-4 h-4" />
                        Discover Datasets
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {researchError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Error Discovering Datasets</p>
                    <p className="text-sm text-destructive/80 mt-1">{researchError}</p>
                  </div>
                  <button onClick={handleDiscoverDatasets} className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition-opacity">
                    Try Again
                  </button>
                </div>
              )}

              {/* Loading */}
              {researchLoading && <SkeletonDatasetCards />}

              {/* Results */}
              {!researchLoading && datasets.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">
                      Dataset Results
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({currentResearchResults?.total_results ?? datasets.length} found)
                      </span>
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {datasets.map((dataset, idx) => (
                      <DatasetCard key={idx} dataset={dataset} isExpanded={expandedDatasetId === idx} onToggle={() => setExpandedDatasetId(expandedDatasetId === idx ? null : idx)} />
                    ))}
                  </div>

                  {/* Research Landscape Summary + Search Metadata */}
                  {(currentResearchResults?.research_landscape_summary || currentResearchResults?.search_metadata) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentResearchResults?.research_landscape_summary && (
                        <div className="rounded-xl bg-card border border-border shadow-md p-6">
                          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <FiBookOpen className="w-4 h-4 text-primary" />
                            Research Landscape
                          </h3>
                          <div className="text-sm text-muted-foreground leading-relaxed">
                            {renderMarkdown(currentResearchResults.research_landscape_summary)}
                          </div>
                        </div>
                      )}
                      {currentResearchResults?.search_metadata && (
                        <div className="rounded-xl bg-card border border-border shadow-md p-6">
                          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <FiSearch className="w-4 h-4 text-primary" />
                            Search Metadata
                          </h3>
                          <div className="space-y-3 text-sm">
                            {currentResearchResults.search_metadata.query_used && (
                              <div>
                                <span className="font-medium text-foreground">Query:</span>
                                <p className="text-muted-foreground mt-0.5">{currentResearchResults.search_metadata.query_used}</p>
                              </div>
                            )}
                            {Array.isArray(currentResearchResults.search_metadata.sources_searched) && currentResearchResults.search_metadata.sources_searched.length > 0 && (
                              <div>
                                <span className="font-medium text-foreground">Sources Searched:</span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {currentResearchResults.search_metadata.sources_searched.map((src, i) => (
                                    <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                      {src}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {currentResearchResults.search_metadata.filters_applied && (
                              <div>
                                <span className="font-medium text-foreground">Filters:</span>
                                <p className="text-muted-foreground mt-0.5">{currentResearchResults.search_metadata.filters_applied}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!researchLoading && !researchError && datasets.length === 0 && !currentResearchResults && (
                <div className="rounded-xl bg-card border border-border shadow-md p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto flex items-center justify-center mb-4">
                    <FiDatabase className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">No Datasets Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Enter your research topic above and click &quot;Discover Datasets&quot; to find relevant data sources.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ============ AGENT STATUS ============ */}
          <div className="mt-12 rounded-xl bg-card border border-border shadow-md p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <FiZap className="w-4 h-4 text-primary" />
              Agent Network
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {AGENTS.map((agent) => {
                const isActive = activeAgentId === agent.id
                const isSubAgent = agent.id !== MATCH_ORCHESTRATOR_ID && agent.id !== DATASET_DISCOVERY_ID

                return (
                  <div key={agent.id} className={`rounded-lg border p-3 transition-all duration-200 ${isActive ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-background'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                      <span className="text-xs font-semibold text-foreground truncate">{agent.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{agent.purpose}</p>
                    {isSubAgent && (
                      <span className="inline-block mt-1.5 text-xs text-muted-foreground/60 italic">Sub-agent</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
