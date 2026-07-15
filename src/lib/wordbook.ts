import { createClient } from './supabase/client'


const supabase = createClient();

export const wordRepository = {
  //Wordsテーブルに単語を追加
  async create(word: string, userId: string) {
    if (!userId) {
      console.warn('userId is null - skipping query')
      return
    }
    const { data,error } = await supabase
      .from('words')
      .insert([{ word, user_id: userId}])
      .select();
    if(error != null) throw new Error(error.message);
    return data[0];
  },

  //Wordsテーブルの単語を全て取得
  async find(userId: string){
    if (!userId) {
      console.warn('userId is null - skipping query')
      return
    }
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    console.log(data);
    if(error != null) throw new Error(error.message);
    return data.map((word) => {
      return {
        ...word,
      }
    });
  },

  //Wordsテーブルの特定の単語を削除
  async delete(id: number) {
    const {error} = await supabase.from('words').delete().eq('id', id);
    if(error != null) throw new Error(error.message);
    return true;
  }

}




