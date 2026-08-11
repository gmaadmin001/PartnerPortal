export const CATEGORIES = [
  "Getting Established at Destination",
  "Health, Safety & Security",
  "Housing & Accommodation",
  "Immigration & Work Authorization",
  "Moving Belongings",
  "Program Management & Outsourcing",
  "Real Estate Professionals (Realtors)",
  "Strategy, Policy & Advisory",
  "Supporting Employees & Families",
  "Tax, Payroll & Compensation",
  "Technology & Data",
] as const;

export const SUBCATS: Record<string, string[]> = {
  "Getting Established at Destination": [
    "Destination Services Providers (DSPs)",
    "School Search & Education Consultants",
  ],
  "Health, Safety & Security": [
    "International Health Insurance",
    "Travel Health & Medical Services",
    "Travel Risk & Security Services",
  ],
  "Housing & Accommodation": [
    "Corporate Housing / Temporary Accommodations",
    "Furniture & Appliance Rental",
    "Home Sale Program Administrators",
    "Property Management Services",
    "Real Estate Brokers & Agents",
    "Relocation Mortgage & Lending Services",
    "Title / Appraisal & Closing Services",
  ],
  "Immigration & Work Authorization": [
    "Corporate Immigration Service Providers",
    "Document & Credential Services",
    "Immigration Law Firms",
  ],
  "Moving Belongings": [
    "Freight Forwarders",
    "Household Goods Movers (Domestic & International)",
    "Pet Relocation Specialists",
    "Storage Providers",
    "Vehicle Transport Specialists",
  ],
  "Program Management & Outsourcing": [
    "Lump Sum / Flex Program Administrators",
    "Move Coordination Specialists",
    "Relocation Management Companies (RMCs)",
  ],
  "Real Estate Professionals (Realtors)": [
    "Realtors Serving the Mobility Market",
  ],
  "Strategy, Policy & Advisory": [
    "Benchmarking & Data Services",
    "Mobility Consulting Firms",
  ],
  "Supporting Employees & Families": [
    "Executive Coaching",
    "Intercultural & Cross-Cultural Training",
    "Language Training Providers",
    "Mental Health & Wellbeing Services",
    "Spouse & Partner Career Services",
  ],
  "Tax, Payroll & Compensation": [
    "Compensation & Benefits Consulting",
    "Employer of Record / PEO Services",
    "Expatriate Tax Services",
    "Global Payroll Providers",
  ],
  "Technology & Data": [
    "Compliance & Tracking Tools",
    "Cost of Living & Hardship Data",
    "Expense Management Software",
    "Immigration Technology",
    "Mobility Management Platforms",
    "Tax Technology Platforms",
  ],
};
