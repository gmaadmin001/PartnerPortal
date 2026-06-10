export interface ServiceRegistration {
  id: string;
  user_id: string;
  company_name: string | null;
  slug: string | null;
  website_url: string | null;
  short_description: string | null;
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
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  membership_plan: string | null;
  membership_billing: string | null;
  status: string | null;
  claimed_by: string | null;
  claimed_at: string | null;
  claim_status: string | null;
  created_at: string;
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
