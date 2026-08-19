import api from "@/lib/axios";
import type { EmailDomains } from "@/types/response/EmailDomains";
import type { UpdateEmailDomainsRequest } from "@/types/request/UpdateEmailDomainsRequest";

export const getEmailDomains = async (): Promise<EmailDomains> => {
  const response = await api.get<EmailDomains>("/settings/email-domains");
  return response.data;
};

export const updateEmailDomains = async (
  emailDomainsData: UpdateEmailDomainsRequest
): Promise<EmailDomains> => {
  const response = await api.put<EmailDomains>("/settings/email-domains", emailDomainsData);
  return response.data;
};
