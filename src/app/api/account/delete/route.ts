import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdmin } from "@supabase/supabase-js";

export async function POST(request: Request) {
  //リクエストボディからパスワード取得
  let password: string | undefined;

  try {
    const body = await request.json();
    password = body?.password;
  } catch {
    return NextResponse.json(
      { ok: false, message: "不正なリクエストです。" },
      { status: 400 }
    );
  }

  if (!password) {
    return NextResponse.json(
      { ok: false, message: "パスワードが入力されていません。" },
      { status: 400 }
    );
  }

  //ログイン中ユーザー取得
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      //リクエストのヘッダーからすべての Cookie を取得して、Supabase に渡す
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();



  if (!user?.email) {
    return NextResponse.json(
      { ok: false, message: "ユーザー情報の取得に失敗しました。" },
      { status: 400 }
    );
  }

  //パスワードで再認証
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (signInError) {
    // パスワード不一致
    return NextResponse.json(
      { ok: false, message: "パスワードが違います。" },
      { status: 400 }
    );
  }

  //Adminでユーザー削除
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);

  if (delErr) {
    return NextResponse.json(
      {
        ok: false,
        message: delErr.message || "アカウント削除に失敗しました。",
      },
      { status: 400 }
    );
  }

  // 5. 正常終了
  return NextResponse.json({ ok: true });
}
