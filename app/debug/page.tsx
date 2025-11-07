"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      console.error('Test failed:', error)
      setTestResults({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTest()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runTest} disabled={loading} className="mb-4">
            {loading ? 'Testing...' : 'Run Test Again'}
          </Button>
          
          {testResults && (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
