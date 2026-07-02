export interface TripRow {
  id: string
  date: string
  type: string
  starting_point: string
  destination: string
  trip_number: string
  trailer_number: string
  truck_number: string
}

export interface TripSheet {
  id?: string
  user_id?: string
  company_name: string
  driver_name: string
  start_date: string
  end_date: string
  start_postal_code: string
  destination_postal_code: string
  trips: TripRow[]
  driver_signature: string
  signature_date: string
  created_at?: string
  trip_numbers?: string
  truck_number?: string
  start_date_time?: string
  end_date_time?: string
  stops?: unknown[]
  start_km?: string
  end_km?: string
  total_km?: number
  total_miles?: number
}

export interface Profile {
  id: string
  email: string
  full_name: string
  created_at: string
}

export interface AdminUser {
  id: string
  email: string
  full_name: string
  created_at: string
}

export interface DriverWithStats {
  id: string
  email: string
  full_name: string
  created_at: string
  trip_count: number
  total_km: number
}
