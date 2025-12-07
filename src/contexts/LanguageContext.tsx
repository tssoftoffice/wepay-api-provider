'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { th } from '@/locales/th'
import { en } from '@/locales/en'

type Language = 'th' | 'en'
type Translations = typeof th

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('th') // Default to Thai
    const [t, setT] = useState<Translations>(th)

    useEffect(() => {
        setT(language === 'th' ? th : en)
    }, [language])

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
