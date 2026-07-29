import { supabaseAdmin } from './supabase-server'

export type CreateCustomerInput = {
  first_name: string
  last_name: string
  email: string
  phone: string
}

export type CreatedCustomerSummary = {
  customer: { cid: string; first_name: string; last_name: string; email: string; phone: string; city: string }
  policy: { id: string; policy_number: string; premium_amount: number }
  vehicle: { id: string; year: number; make: string; model: string; ownership: string }
  driver: { id: string; date_of_birth: string; license_number: string }
  billing: { id: string; status: string; payment_frequency: string; balance: number }
  payment_method: { id: string; brand: string | null; type: string; last_four: string }
  payment: { id: string; confirmation_number: string; amount: number; status: string }
}

const CITIES: Array<{ city: string; zip: string; region: string; streetPool: string[] }> = [
  { city: 'Croydon',      zip: 'CR0 1LB', region: 'Greater London',      streetPool: ['George St', 'Wellesley Rd', 'Park Lane'] },
  { city: 'Kingston upon Thames', zip: 'KT1 1EU', region: 'Greater London', streetPool: ['Clarence St', 'London Rd', 'Richmond Rd'] },
  { city: 'Birmingham',   zip: 'B1 1AA',  region: 'West Midlands',       streetPool: ['Corporation St', 'Bristol Rd', 'Hagley Rd'] },
  { city: 'Coventry',     zip: 'CV1 1GF', region: 'West Midlands',       streetPool: ['Foleshill Rd', 'Binley Rd', 'Kenilworth Rd'] },
  { city: 'Manchester',   zip: 'M1 1AE',  region: 'Greater Manchester',  streetPool: ['Deansgate', 'Oxford Rd', 'Wilmslow Rd'] },
  { city: 'Salford',      zip: 'M5 4WT',  region: 'Greater Manchester',  streetPool: ['Chapel St', 'Eccles New Rd', 'Regent Rd'] },
  { city: 'Leeds',        zip: 'LS1 4DY', region: 'West Yorkshire',      streetPool: ['Kirkstall Rd', 'Otley Rd', 'York Rd'] },
  { city: 'Guildford',    zip: 'GU1 3UW', region: 'Surrey',              streetPool: ['High St', 'Woodbridge Rd', 'Epsom Rd'] },
]

const VEHICLE_POOL: Array<{ make: string; models: Array<{ model: string; trims: string[] }> }> = [
  { make: 'Ford',          models: [{ model: 'F-150',     trims: ['XLT', 'Lariat'] }, { model: 'Escape', trims: ['SE', 'Titanium'] }] },
  { make: 'Toyota',        models: [{ model: 'Camry',     trims: ['LE', 'XLE', 'XSE'] }, { model: 'RAV4',  trims: ['LE', 'XLE'] }] },
  { make: 'Tesla',         models: [{ model: 'Model 3',   trims: ['Long Range', 'Performance'] }, { model: 'Model Y', trims: ['Long Range'] }] },
  { make: 'Mazda',         models: [{ model: 'CX-5',      trims: ['Touring', 'Grand Touring'] }] },
  { make: 'Hyundai',       models: [{ model: 'Tucson',    trims: ['SEL', 'Limited'] }, { model: 'Elantra', trims: ['SEL', 'Limited'] }] },
  { make: 'Honda',         models: [{ model: 'Civic',     trims: ['EX', 'Touring'] }, { model: 'CR-V',    trims: ['EX', 'EX-L'] }] },
  { make: 'BMW',           models: [{ model: '330i',      trims: ['xDrive', 'M Sport'] }, { model: 'X3',   trims: ['xDrive30i'] }] },
  { make: 'Mercedes-Benz', models: [{ model: 'C 300',     trims: ['4MATIC'] }, { model: 'GLC 300',       trims: ['4MATIC'] }] },
  { make: 'Audi',          models: [{ model: 'Q5',        trims: ['Premium Plus 45 TFSI'] }, { model: 'A4', trims: ['Premium', 'Premium Plus'] }] },
  { make: 'Volvo',         models: [{ model: 'XC60',      trims: ['T6 Inscription', 'T5 Momentum'] }] },
  { make: 'Subaru',        models: [{ model: 'Outback',   trims: ['Premium', 'Limited'] }] },
  { make: 'Volkswagen',    models: [{ model: 'Atlas',     trims: ['SE', 'SEL'] }, { model: 'Tiguan',     trims: ['SE', 'SEL'] }] },
]

const BRANDS = ['Visa', 'Mastercard', 'Amex']
const PAYMENT_TYPES: Array<'credit_card' | 'debit_card' | 'bank_account'> = ['credit_card', 'debit_card', 'bank_account']
const OWNERSHIPS: Array<'owned' | 'financed' | 'leased'> = ['owned', 'financed', 'leased']

const PHONE_E164 = /^\+[1-9]\d{7,14}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomLicense() {
  return String(randInt(10_000_000, 99_999_999))
}

function randomLastFour() {
  return String(randInt(1000, 9999))
}

function randomDOB(): string {
  const year = randInt(1970, 1991)
  const month = randInt(1, 12)
  const maxDay = new Date(year, month, 0).getDate()
  const day = randInt(1, maxDay)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function randomStreetNumber() {
  return randInt(1, 240)
}

function randomPremium() {
  return randInt(1500, 3200)
}

function randomMileage() {
  return randInt(8000, 14000) * (Math.random() < 0.5 ? 1 : 1)
}

function randomVIN() {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'
  let s = ''
  for (let i = 0; i < 17; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

function randomVehicleYear() {
  return randInt(2019, 2024)
}

function randomBilling(premium: number) {
  // 80% current, 12% payment_pending, 8% past_due — adds realism without dominating
  const r = Math.random()
  const status: 'current' | 'payment_pending' | 'past_due' = r < 0.8 ? 'current' : r < 0.92 ? 'payment_pending' : 'past_due'
  const frequency: 'monthly' | 'quarterly' | 'semi_annual' = pick(['monthly', 'monthly', 'monthly', 'quarterly', 'semi_annual'])
  const divisor = frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 2
  const balance = Math.round((premium / divisor) * 100) / 100
  const autopay = status === 'current' ? Math.random() < 0.85 : Math.random() < 0.4
  return { status, frequency, balance, autopay, paperless: Math.random() < 0.7 }
}

function randomPaymentMethod() {
  const type = pick(PAYMENT_TYPES)
  const brand = type === 'bank_account' ? null : pick(BRANDS)
  return { type, brand, last_four: randomLastFour() }
}

function validate(input: CreateCustomerInput): string | null {
  if (!input.first_name?.trim()) return 'First name is required'
  if (!input.last_name?.trim()) return 'Last name is required'
  if (!EMAIL_RE.test(input.email)) return 'Invalid email address'
  if (!PHONE_E164.test(input.phone)) return 'Phone must be in E.164 format (e.g. +447911123456)'
  return null
}

async function nextPaymentConfirmation(): Promise<string> {
  const { data } = await supabaseAdmin
    .from('payments')
    .select('confirmation_number')
    .like('confirmation_number', 'PAY-20260415-%')
    .order('confirmation_number', { ascending: false })
    .limit(1)
  const latest = data?.[0]?.confirmation_number as string | undefined
  const n = latest ? Number(latest.split('-').pop()) + 1 : 1
  return `PAY-20260415-${String(n).padStart(3, '0')}`
}

async function freshPolicyNumber(): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const candidate = `AUTO-2026-${randInt(1000, 9999)}`
    const { data } = await supabaseAdmin
      .from('policies')
      .select('id')
      .eq('policy_number', candidate)
      .maybeSingle()
    if (!data) return candidate
  }
  throw new Error('Could not allocate a unique policy number after 6 tries')
}

async function emailAlreadyUsed(email: string, excludeCid?: string): Promise<boolean> {
  let q = supabaseAdmin.from('customers').select('cid').ilike('email', email).limit(1)
  if (excludeCid) q = q.neq('cid', excludeCid)
  const { data } = await q
  return Boolean(data && data.length > 0)
}

export async function checkEmailAvailable(email: string, excludeCid?: string): Promise<string | null> {
  if (await emailAlreadyUsed(email, excludeCid)) return 'Email already in use by another customer'
  return null
}

export async function createSyntheticCustomer(input: CreateCustomerInput): Promise<
  { ok: true; summary: CreatedCustomerSummary } | { ok: false; error: string; status: number }
> {
  const validationError = validate(input)
  if (validationError) return { ok: false, error: validationError, status: 400 }

  const first_name = input.first_name.trim()
  const last_name = input.last_name.trim()
  const email = input.email.trim()
  const phone = input.phone.trim()

  const emailError = await checkEmailAvailable(email)
  if (emailError) return { ok: false, error: emailError, status: 409 }

  const cityRow = pick(CITIES)
  const street = `${randomStreetNumber()} ${pick(cityRow.streetPool)}`
  const address = { street, city: cityRow.city, state: cityRow.region, zip: cityRow.zip, country: 'UK' }

  const { data: customerRow, error: customerErr } = await supabaseAdmin
    .from('customers')
    .insert({
      first_name,
      last_name,
      email,
      phone,
      mailing_address: address,
      demo_otp: '123456',
      source: 'synthetic',
    })
    .select('cid')
    .single()

  if (customerErr || !customerRow) {
    const message = customerErr?.message ?? 'Failed to create customer'
    const isDupPhone = message.toLowerCase().includes('phone') && message.toLowerCase().includes('unique')
    return { ok: false, error: isDupPhone ? 'Phone number already in use' : message, status: 409 }
  }

  const cid = customerRow.cid as string

  try {
    const policy_number = await freshPolicyNumber()
    const premium_amount = randomPremium()

    const { data: policyRow, error: policyErr } = await supabaseAdmin
      .from('policies')
      .insert({
        customer_id: cid,
        policy_number,
        type: 'auto',
        status: 'active',
        effective_date: '2026-01-01',
        expiration_date: '2027-01-01',
        premium_amount,
      })
      .select('id')
      .single()
    if (policyErr || !policyRow) throw new Error(policyErr?.message ?? 'Policy insert failed')

    const make = pick(VEHICLE_POOL)
    const model = pick(make.models)
    const trim = pick(model.trims)
    const ownership = pick(OWNERSHIPS)
    const year = randomVehicleYear()
    const vin = randomVIN()

    const { data: vehicleRow, error: vehicleErr } = await supabaseAdmin
      .from('vehicles')
      .insert({
        policy_id: policyRow.id,
        vin,
        year,
        make: make.make,
        model: model.model,
        trim,
        usage: 'commute',
        annual_mileage: randomMileage(),
        ownership,
        garaging_address: address,
      })
      .select('id')
      .single()
    if (vehicleErr || !vehicleRow) throw new Error(vehicleErr?.message ?? 'Vehicle insert failed')

    const dob = randomDOB()
    const license_number = randomLicense()

    const { data: driverRow, error: driverErr } = await supabaseAdmin
      .from('drivers')
      .insert({
        policy_id: policyRow.id,
        first_name,
        last_name,
        date_of_birth: dob,
        license_number,
        license_state: cityRow.region,
        relationship: 'self',
        is_primary_named_insured: true,
        primary_vehicle_id: vehicleRow.id,
      })
      .select('id')
      .single()
    if (driverErr || !driverRow) throw new Error(driverErr?.message ?? 'Driver insert failed')

    const billing = randomBilling(premium_amount)
    const { data: billingRow, error: billingErr } = await supabaseAdmin
      .from('billing_accounts')
      .insert({
        customer_id: cid,
        balance: billing.balance,
        due_date: '2026-05-15',
        status: billing.status,
        payment_frequency: billing.frequency,
        autopay_enabled: billing.autopay,
        paperless_enabled: billing.paperless,
        billing_email: email,
      })
      .select('id')
      .single()
    if (billingErr || !billingRow) throw new Error(billingErr?.message ?? 'Billing insert failed')

    const pm = randomPaymentMethod()
    const { data: pmRow, error: pmErr } = await supabaseAdmin
      .from('payment_methods')
      .insert({
        customer_id: cid,
        type: pm.type,
        last_four: pm.last_four,
        brand: pm.brand,
        is_default: true,
      })
      .select('id')
      .single()
    if (pmErr || !pmRow) throw new Error(pmErr?.message ?? 'Payment method insert failed')

    const confirmation_number = await nextPaymentConfirmation()
    const paymentStatus = billing.status === 'past_due' ? 'failed' : 'completed'

    const { data: paymentRow, error: paymentErr } = await supabaseAdmin
      .from('payments')
      .insert({
        billing_account_id: billingRow.id,
        payment_method_id: pmRow.id,
        amount: billing.balance,
        status: paymentStatus,
        confirmation_number,
        created_at: '2026-04-15T14:00:00+00:00',
      })
      .select('id')
      .single()
    if (paymentErr || !paymentRow) throw new Error(paymentErr?.message ?? 'Payment insert failed')

    return {
      ok: true,
      summary: {
        customer: { cid, first_name, last_name, email, phone, city: cityRow.city },
        policy: { id: policyRow.id, policy_number, premium_amount },
        vehicle: { id: vehicleRow.id, year, make: make.make, model: model.model, ownership },
        driver: { id: driverRow.id, date_of_birth: dob, license_number },
        billing: { id: billingRow.id, status: billing.status, payment_frequency: billing.frequency, balance: billing.balance },
        payment_method: { id: pmRow.id, brand: pm.brand, type: pm.type, last_four: pm.last_four },
        payment: { id: paymentRow.id, confirmation_number, amount: billing.balance, status: paymentStatus },
      },
    }
  } catch (e) {
    // Roll back by deleting the customer; CASCADE cleans up everything that was inserted.
    await supabaseAdmin.from('customers').delete().eq('cid', cid)
    const msg = e instanceof Error ? e.message : 'Synthetic insert failed'
    return { ok: false, error: msg, status: 500 }
  }
}

export function validatePatchInput(patch: Partial<CreateCustomerInput>): string | null {
  if (patch.email !== undefined && !EMAIL_RE.test(patch.email)) return 'Invalid email address'
  if (patch.phone !== undefined && !PHONE_E164.test(patch.phone)) return 'Phone must be in E.164 format (e.g. +14155551234)'
  if (patch.first_name !== undefined && !patch.first_name.trim()) return 'First name cannot be empty'
  if (patch.last_name !== undefined && !patch.last_name.trim()) return 'Last name cannot be empty'
  return null
}
