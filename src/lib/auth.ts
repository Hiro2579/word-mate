import { createClient } from "./supabase/client"


export const authRepository = {


  async signUp( email: string, password: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },


  async signIn(email: string, password: string){
    const supabase = await createClient();
    const {data, error} = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error != null ) throw new Error(error.message);
    return {data, error};
  },


  async signOut(){
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if(error!= null) throw new Error(error.message);
    return true;
  },

  async changeMyPassword( currentPassword: string, newPassword:string) {
    const supabase = await createClient();
    // Re-authenticate user
    const { data: { user } } = await supabase.auth.getUser();
    if(!user?.email) throw new Error("USER_EMAIL_NOT_FOUND");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError != null) {
      console.error("signIn failed:", signInError.message);
      throw new Error("INCORRECT_PASSWORD");
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (updateError != null) {
      console.error("updateUser failed:", updateError.message);
      throw new Error("PASSWORD_UPDATE_FAILED");
    }

    return true;
  }

};