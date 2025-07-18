import { LinkButton } from '../components/ui/link-button'

export default async function Home() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl text-gray-800">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">アプリへようこそ！</h1>

        <div>
          <p className="mb-4">ログインして管理しましょう。</p>
          <div className="flex space-x-4">
            <LinkButton href="/sign-in" variant="outline">
              ログイン
            </LinkButton>
            <LinkButton href="/sign-up" variant="primary">
              新規登録
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  )
}
