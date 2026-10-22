export type SiteSettings = {
  contact_whatsapp: string;
  contact_email: string;
  office_address: string;
  bank_name: string;
  bank_account_no: string;
  bank_account_holder: string;
  social_instagram: string;
  social_youtube: string;
  social_linkedin: string;
  social_tiktok: string;
  social_facebook: string;
  social_x: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  contact_whatsapp: "",
  contact_email: "halo@altara.or.id",
  office_address: "Jakarta · Yogyakarta · Kupang",
  bank_name: "",
  bank_account_no: "",
  bank_account_holder: "",
  social_instagram: "https://instagram.com/altara.or.id",
  social_youtube: "https://youtube.com/@altara",
  social_linkedin: "https://linkedin.com/company/altara",
  social_tiktok: "",
  social_facebook: "",
  social_x: "",
};
