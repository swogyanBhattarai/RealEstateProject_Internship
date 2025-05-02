import React from 'react'
import Layout from '../Layout'

const SettingsPage: React.FC = () => {
  return (
    <Layout>
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <form className="mt-4">
          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              API Key
            </label>
            <input
              type="text"
              id="apiKey"
              className="mt-1 p-2 w-full border rounded"
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Save Settings
          </button>
        </form>
      </div>
    </Layout>
  )
}

export default SettingsPage
