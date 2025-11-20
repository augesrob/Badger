"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Truck, Users, Activity, Menu } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Truck Management System</h1>
              <p className="text-sm text-gray-500">Real-time synchronized warehouse operations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Truck Management</h2>
          <p className="text-xl text-gray-600">Select a section to begin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Print Room Card */}
          <Link href="/printroom">
            <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <Menu className="w-12 h-12 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-center text-gray-900 text-2xl">Print Room</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  Route planning, batch organization, and truck door assignments
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>• Manage loading doors 13A-15B</li>
                  <li>• Assign routes and batches</li>
                  <li>• Track pods and pallets</li>
                  <li>• Add notes and documentation</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* PreShift Card */}
          <Link href="/preshift">
            <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-green-100 p-4 rounded-full">
                    <Users className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-center text-gray-900 text-2xl">PreShift Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  Configure initial positions and driver assignments
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>• Manage staging doors 18-28</li>
                  <li>• Driver and equipment database</li>
                  <li>• Position tracking (4 per door)</li>
                  <li>• Van and semi number tracking</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* Movement Card */}
          <Link href="/movement">
            <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-purple-100 p-4 rounded-full">
                    <Activity className="w-12 h-12 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-center text-gray-900 text-2xl">Live Movement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  Real-time truck tracking and status updates
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>• Live movement dashboard</li>
                  <li>• 14 truck status options</li>
                  <li>• 6 door status options</li>
                  <li>• Filter and search capabilities</li>
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">6</div>
                  <div className="text-sm text-gray-600">Loading Doors</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">11</div>
                  <div className="text-sm text-gray-600">Staging Doors</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">5</div>
                  <div className="text-sm text-gray-600">Routes</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">44</div>
                  <div className="text-sm text-gray-600">Total Positions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
