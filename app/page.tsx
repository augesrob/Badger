"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Users, Activity, Shield, Menu, X } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {menuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
              <Truck className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Truck Management System</h1>
                <p className="text-sm text-gray-500">Real-time synchronized warehouse operations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMenuOpen(false)}>
          <div 
            className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Navigation</h2>
              <nav className="space-y-2">
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 transition-colors cursor-pointer">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-700 font-medium">Home</span>
                  </div>
                </Link>
                <Link href="/printroom" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <Truck className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">Print Room</span>
                  </div>
                </Link>
                <Link href="/preshift" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <Users className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">PreShift Setup</span>
                  </div>
                </Link>
                <Link href="/movement" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <Activity className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">Live Movement</span>
                  </div>
                </Link>
                <Link href="/admin" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">Admin Settings</span>
                  </div>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/printroom">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Truck className="w-8 h-8 text-blue-600" />
                  <CardTitle className="text-gray-900">Print Room</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Route planning, batch organization, and truck assignments for loading operations
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/preshift">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-green-600" />
                  <CardTitle className="text-gray-900">PreShift Setup</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Driver database, equipment assignments, and staging door positions
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/movement">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Activity className="w-8 h-8 text-purple-600" />
                  <CardTitle className="text-gray-900">Live Movement</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Real-time truck tracking, status updates, and loading coordination
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-2 border-red-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-red-600" />
                  <CardTitle className="text-gray-900">Admin Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  System configuration, data management, and auto-reset scheduling
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* System Overview */}
        <Card className="mt-6 bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Print Room</h3>
                <p className="text-sm text-gray-600">
                  Manage loading doors 13A-15B, assign routes (Fond Du Lac, Green Bay, Wausau, Caledonia, Chippewa Falls), 
                  track pods and pallets, and organize trucks into batches for sequential loading.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">PreShift Setup</h3>
                <p className="text-sm text-gray-600">
                  Configure semi driver database with tractor and trailer assignments. Manage staging doors 18-28 
                  with 4-position depth tracking for box trucks, vans, and tandems.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Live Movement</h3>
                <p className="text-sm text-gray-600">
                  Monitor real-time truck positions with 14 status types (On Route, In Door, Put Away, etc.) 
                  and 6 door statuses (Loading, EOT, EOT+1, etc.). Filter by route or status for quick access.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Admin Settings</h3>
                <p className="text-sm text-gray-600">
                  Configure daily auto-reset schedules, manage data deletion, and protect critical databases. 
                  Semi Tractor & Trailer Database is permanently protected from auto-deletion.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
