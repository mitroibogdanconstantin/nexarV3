import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password })
  },
  
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  },
  
  signOut: async () => {
    return await supabase.auth.signOut()
  },
  
  getUser: async () => {
    return await supabase.auth.getUser()
  },
  
  updatePassword: async (password: string) => {
    return await supabase.auth.updateUser({ password })
  }
}

// Profiles helper functions
export const profiles = {
  update: async (userId: string, profileData: any) => {
    return await supabase
      .from('profiles')
      .update(profileData)
      .eq('user_id', userId)
      .select()
  },
  
  uploadAvatar: async (userId: string, file: File) => {
    // Upload file to storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Math.random()}.${fileExt}`
    const filePath = `avatars/${fileName}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file)
    
    if (uploadError) {
      return { data: null, error: uploadError }
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath)
    
    // Update profile with new avatar URL
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', userId)
      .select()
    
    return { data, error }
  }
}

// Listings helper functions
export const listings = {
  getAll: async () => {
    return await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
  },
  
  getById: async (id: string) => {
    return await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single()
  },
  
  create: async (listingData: any) => {
    return await supabase
      .from('listings')
      .insert(listingData)
      .select()
  },
  
  update: async (id: string, listingData: any) => {
    return await supabase
      .from('listings')
      .update(listingData)
      .eq('id', id)
      .select()
  },
  
  delete: async (id: string) => {
    return await supabase
      .from('listings')
      .delete()
      .eq('id', id)
  }
}

// Romanian cities data
export const romanianCities = [
  'București',
  'Cluj-Napoca',
  'Timișoara',
  'Iași',
  'Constanța',
  'Craiova',
  'Brașov',
  'Galați',
  'Ploiești',
  'Oradea',
  'Brăila',
  'Arad',
  'Pitești',
  'Sibiu',
  'Bacău',
  'Târgu Mureș',
  'Baia Mare',
  'Buzău',
  'Botoșani',
  'Satu Mare',
  'Râmnicu Vâlcea',
  'Drobeta-Turnu Severin',
  'Suceava',
  'Piatra Neamț',
  'Târgu Jiu',
  'Tulcea',
  'Focșani',
  'Bistrița',
  'Reșița',
  'Alba Iulia',
  'Hunedoara',
  'Deva',
  'Zalău',
  'Sfântu Gheorghe',
  'Vaslui',
  'Roman',
  'Turda',
  'Mediaș',
  'Slobozia',
  'Mangalia',
  'Onești',
  'Năvodari',
  'Miercurea Ciuc',
  'Petroșani',
  'Lugoj',
  'Medgidia',
  'Pașcani',
  'Câmpina',
  'Dej',
  'Reghin',
  'Sebeș',
  'Câmpulung',
  'Dorohoi',
  'Rădăuți',
  'Fălticeni',
  'Codlea',
  'Săcele',
  'Făgăraș',
  'Lupeni',
  'Caransebeș',
  'Orăștie',
  'Aiud',
  'Fierbinți-Târg',
  'Cernavodă',
  'Băilești',
  'Mioveni',
  'Curtea de Argeș',
  'Huși',
  'Moreni',
  'Gheorgheni',
  'Odorheiu Secuiesc',
  'Comănești',
  'Motru',
  'Gherla',
  'Dragașani',
  'Târnăveni',
  'Caracal',
  'Adjud',
  'Tecuci',
  'Fetești',
  'Calafat',
  'Salonta',
  'Borșa',
  'Vulcan',
  'Târgoviște',
  'Giurgiu',
  'Măcin',
  'Corabia',
  'Oltenița',
  'Roșiorii de Vede',
  'Turnu Măgurele',
  'Zimnicea',
  'Alexandria',
  'Videle',
  'Călărași',
  'Lehliu Gară',
  'Fundulea',
  'Cernica',
  'Pantelimon',
  'Popești-Leordeni',
  'Voluntari',
  'Chitila',
  'Măgurele',
  'Otopeni',
  'Corbeanca',
  'Domnești',
  'Bragadiru',
  'Buftea'
]