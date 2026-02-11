import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, BookOpen, MessageCircle, Video, Mail, Phone, ExternalLink } from 'lucide-react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const helpCategories = [
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Browse comprehensive guides and tutorials',
    link: '#',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Video,
    title: 'Video Tutorials',
    description: 'Watch step-by-step video guides',
    link: '#',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
    link: '#',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Send us an email for detailed assistance',
    link: 'mailto:support@acc.ltd',
    color: 'from-orange-500 to-red-500',
  },
];

const faqs = [
  {
    question: 'How do I generate an ID card?',
    answer: 'Select "Single Employee" mode, fill in the employee details, upload a photo, and click "Generate & Export PDF".',
  },
  {
    question: 'Can I upload multiple employees at once?',
    answer: 'Yes! Switch to "Bulk Upload" mode and upload an Excel/CSV file with employee data.',
  },
  {
    question: 'How does automatic background removal work?',
    answer: 'Our AI automatically removes backgrounds from uploaded photos using advanced machine learning algorithms.',
  },
  {
    question: 'Where are my generated ID cards stored?',
    answer: 'All employee records are stored securely in your browser\'s local storage and can be accessed from the "View All Employees" section.',
  },
  {
    question: 'Can I customize the ID card design?',
    answer: 'The ID card design uses your company branding and follows ACC\'s standard template for consistency.',
  },
];

export function HelpSupportModal({ isOpen, onClose }: HelpSupportModalProps) {
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Full viewport coverage */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100]"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Modal - Positioned below header */}
          <div className="fixed inset-0 z-[101] pointer-events-none" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="h-full w-full flex items-start justify-center pt-24 pb-8 px-4 pointer-events-none overflow-y-auto">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -20 }}
                className="relative w-full max-w-4xl pointer-events-auto"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />

                <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                  {/* Header */}
                  <div className="relative bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-8 py-6 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <HelpCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">Help & Support</h2>
                          <p className="text-slate-400 text-sm">Get assistance and learn more</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="overflow-y-auto flex-1 p-8 space-y-8">
                    {/* Contact Options */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">How can we help you?</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {helpCategories.map((category, index) => (
                          <motion.a
                            key={category.title}
                            href={category.link}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -3, scale: 1.02 }}
                            className="relative group block"
                          >
                            <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 rounded-xl blur-xl group-hover:opacity-10 transition-all`} />
                            <div className="relative bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 hover:border-slate-600 transition-colors h-full">
                              <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center mb-3 shadow-lg`}>
                                <category.icon className="w-6 h-6 text-white" />
                              </div>
                              <h4 className="text-white font-semibold mb-1 flex items-center gap-2">
                                {category.title}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </h4>
                              <p className="text-slate-400 text-sm">{category.description}</p>
                            </div>
                          </motion.a>
                        ))}
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-1">24/7 Emergency Support</h4>
                          <p className="text-slate-300 text-sm mb-2">
                            For urgent issues, call our emergency helpline
                          </p>
                          <a href="tel:+1-800-ACC-HELP" className="text-red-400 font-medium hover:text-red-300 transition-colors">
                            +1 (800) ACC-HELP
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* FAQs */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h3>
                      <div className="space-y-3">
                        {faqs.map((faq, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                            className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden"
                          >
                            <button
                              onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                              className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                            >
                              <span className="text-white font-medium">{faq.question}</span>
                              <motion.div
                                animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </motion.div>
                            </button>
                            <AnimatePresence>
                              {expandedFaq === index && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-5 pb-4 text-slate-300 text-sm border-t border-slate-700/50 pt-4">
                                    {faq.answer}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-5">
                      <h4 className="text-white font-semibold mb-3">💡 Quick Tips</h4>
                      <ul className="space-y-2 text-sm text-slate-300">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>Use high-quality photos for best results</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>Background removal works best with clear, well-lit images</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>Save your work frequently using the database feature</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>Keyboard shortcut: Press Ctrl+S to quick save</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-8 py-4 bg-slate-800/50 border-t border-slate-700/50 text-center">
                    <p className="text-slate-400 text-sm">
                      Still need help?{' '}
                      <a href="mailto:support@acc.ltd" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                        Contact our support team
                      </a>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Add React import for useState
import React from 'react';