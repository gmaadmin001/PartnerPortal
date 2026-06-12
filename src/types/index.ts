export interface ServiceRegistration {
  id: string;
  user_id: string;
  company_name: string | null;
  slug: string; // NOT NULL in DB
  website_url: string | null;
  short_description: string | null;
  company_bio: string | null;
  logo_url: string | null;
  photos: object[] | null; // jsonb array
  primary_category: string | null;
  sub_category: string | null;
  register_as: string | null;
  delivery_model: string | null;
  company_size: string | null;
  certifications: string | null;
  headquarters_country: string | null;
  headquarters_city: string | null;
  countries_served: string[] | null;
  states_served: string[] | null;
  diversity_flags: string[] | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  membership_plan: string | null;
  membership_billing: string | null;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  claimed_by: string | null;
  claimed_at: string | null;
  claim_status: string | null;
  core_services: string[] | null;
  premium_slug: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  service_slug: string;
  reviewer_name: string | null;
  reviewer_company: string | null;
  rating: number;
  body: string | null;
  created_at: string;
}
