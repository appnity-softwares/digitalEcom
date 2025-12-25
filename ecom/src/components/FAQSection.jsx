import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, HelpCircle } from 'lucide-react';

// Single FAQ Item Component
const FAQItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <motion.div
            layout
            className="glass-card-hover rounded-2xl overflow-hidden cursor-pointer"
            onClick={onClick}
        >
            <div className="p-6 md:p-8">
                <div className="flex justify-between items-start gap-4">
                    {/* Question Text */}
                    <h3 className="text-lg md:text-xl font-bold text-foreground leading-tight select-none">
                        {question}
                    </h3>

                    {/* Toggle Icon */}
                    <motion.button
                        initial={false}
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-0.5 p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                        <Plus className="w-5 h-5" />
                    </motion.button>
                </div>

                {/* Answer Content (Collapsible) */}
                <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="overflow-hidden"
                        >
                            <p className="text-muted-foreground font-medium leading-relaxed mt-4 pt-4 border-t border-white/10">
                                {answer}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const FAQSection = () => {
    const [openItems, setOpenItems] = useState({
        0: true,
        1: true,
    });

    const toggleItem = (index) => {
        setOpenItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const faqData = [
        {
            question: "How long does it take to set up the templates?",
            answer: "Most templates can be set up in under 10 minutes. Simply download, install dependencies, and you're ready to customize."
        },
        {
            question: "Can I use templates for client projects?",
            answer: "Yes, you can use our templates for both personal and client projects. However, you cannot resell or redistribute the templates themselves."
        },
        {
            question: "Are the templates customizable?",
            answer: "Yes, all our templates are fully customizable. You can easily change colors, fonts, images, and layouts to match your brand."
        },
        {
            question: "Do you offer refunds?",
            answer: "Due to the digital nature of our products, we don't offer refunds. We encourage you to review the template details and demo carefully before purchasing."
        },
        {
            question: "Can I try before I buy?",
            answer: "Yes, each template has a live demo that you can explore to get a feel for its design and functionality before making a purchase."
        },
        {
            question: "What support is included?",
            answer: "All purchases include 6 months of support via email. Pro subscribers get priority support and access to our private Discord community."
        },
        {
            question: "How do I download my templates?",
            answer: "After purchase, you can download your templates from your profile page. You'll also receive a download link via email."
        }
    ];

    const col1 = faqData.slice(0, 4);
    const col2 = faqData.slice(4);

    return (
        <div className="w-full bg-background px-6 py-20 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 border border-primary/20">
                        <HelpCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">FAQ</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Everything you need to know about our templates and services.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* Left Column */}
                    <div className="flex flex-col gap-4">
                        {col1.map((item, index) => (
                            <FAQItem
                                key={index}
                                question={item.question}
                                answer={item.answer}
                                isOpen={openItems[index]}
                                onClick={() => toggleItem(index)}
                            />
                        ))}
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-4">
                        {col2.map((item, index) => {
                            const actualIndex = index + 4;
                            return (
                                <FAQItem
                                    key={actualIndex}
                                    question={item.question}
                                    answer={item.answer}
                                    isOpen={openItems[actualIndex]}
                                    onClick={() => toggleItem(actualIndex)}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQSection;