export interface TripStop {
  id: string
  date: string
  time: string
  type: string
  address: string
  trip_number: string
  trailer_number: string
}

export interface TripSheet {
  id?: string
  user_id?: string
  driver_name: string
  company_name: string
  trip_numbers: string
  truck_number: string
  start_date_time: string
  end_date_time: string
  start_km: string
  end_km: string
  total_km: number
  total_miles: number
  stops: TripStop[]
  driver_signature: string
  signature_date: string
  created_at?: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  created_at: string
}

export interface AnalyticsSummary {
  total_trips: number
  total_km: number
  trips_this_month: number
  km_this_month: number
  weekly_km: { week: string; km: number }[]
  top_routes: { route: string; count: number }[]
}
