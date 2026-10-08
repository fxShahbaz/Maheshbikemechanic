import { getProfileDetails } from "@/lib/student-portal";
import { apiJson, authenticateActiveStudent, publicProfile } from "@/lib/student-api";
import { maskAadhar } from "@/lib/types";

export async function GET(request: Request) {
  const auth = await authenticateActiveStudent(request);
  if (auth instanceof Response) return auth;

  const { admission, fees } = await getProfileDetails(auth.profile);
  return apiJson({
    profile: publicProfile(auth.profile),
    // Only what the profile screen shows; Aadhar leaves the server masked
    admission: admission && {
      batch_no: admission.batch_no,
      created_at: admission.created_at,
      age: admission.age,
      address: admission.address,
      aadhar_masked: maskAadhar(admission.aadhar_no),
      family_name: admission.family_name,
      family_relation: admission.family_relation,
      family_phone: admission.family_phone,
    },
    fees,
  });
}
