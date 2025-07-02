import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Credențialele Supabase pentru noua bază de date
const supabaseUrl = "https://hwbiywnkrsdgbiakwjtv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Yml5d25rcnNkZ2JpYWt3anR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NjkzOTQsImV4cCI6MjA2NzA0NTM5NH0.DIWt1xS2XM9lWOrwAjIqVDvtOYBTuFILce5AbGjYfU8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true, // Pentru confirmarea emailului
		flowType: "pkce",
	},
});

// Tipuri pentru baza de date
export interface User {
	id: string;
	user_id: string; // ID-ul din auth.users
	name: string;
	email: string;
	phone?: string;
	location?: string;
	seller_type: "individual" | "dealer";
	avatar_url?: string;
	description?: string;
	website?: string;
	verified: boolean;
	is_admin: boolean;
	created_at: string;
	updated_at: string;
}

export interface Listing {
	id: string;
	title: string;
	price: number;
	year: number;
	mileage: number;
	location: string;
	category: string;
	brand: string;
	model: string;
	engine_capacity: number;
	fuel_type: string;
	transmission: string;
	condition: string;
	color: string;
	description: string;
	images: string[];
	features: string[];
	seller_id: string; // ID-ul din tabela users
	seller_name: string;
	seller_type: "individual" | "dealer";
	availability?: "pe_stoc" | "la_comanda"; // Doar pentru dealeri
	status: "pending" | "active" | "rejected" | "sold";
	views_count: number;
	created_at: string;
	updated_at: string;
}

// Lista orașelor din România
export const romanianCities = [
	"București S1",
	"București S2", 
	"București S3",
	"București S4",
	"București S5",
	"București S6",
	"Cluj-Napoca",
	"Timișoara",
	"Iași",
	"Constanța",
	"Brașov",
	"Craiova",
	"Galați",
	"Oradea",
	"Ploiești",
	"Sibiu",
	"Bacău",
	"Râmnicu Vâlcea",
	"Pitești",
	"Arad",
	"Baia Mare",
	"Buzău",
	"Botoșani",
	"Satu Mare",
	"Târgu Mureș",
	"Focșani",
	"Târgoviște",
	"Deva",
	"Reșița",
	"Alba Iulia",
	"Bistrița",
	"Călărași",
	"Drobeta-Turnu Severin",
	"Hunedoara",
	"Piatra Neamț",
	"Roman",
	"Slatina",
	"Suceava",
	"Tulcea",
	"Vaslui",
	"Zalău"
];

// Funcții pentru autentificare
export const auth = {
	signUp: async (email: string, password: string, userData: any) => {
		try {
			console.log("🚀 Începe procesul de înregistrare pentru:", email);

			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: userData,
					emailRedirectTo: `${window.location.origin}/auth/confirm`,
				},
			});

			if (error) {
				console.error("❌ Eroare la înregistrare:", error);
				return { data, error };
			}

			console.log("✅ Utilizator creat cu succes:", data.user?.email);
			return { data, error };
		} catch (err) {
			console.error("💥 Eroare la înregistrare:", err);
			return { data: null, error: err };
		}
	},

	signIn: async (email: string, password: string) => {
		try {
			console.log("🔐 Începe procesul de conectare pentru:", email);

			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				console.error("❌ Eroare la conectare:", error);
				return { data, error };
			}

			console.log("✅ Utilizator conectat cu succes:", data.user?.email);
			return { data, error };
		} catch (err) {
			console.error("💥 Eroare la conectare:", err);
			return { data: null, error: err };
		}
	},

	signOut: async () => {
		console.log("👋 Deconectare utilizator...");
		localStorage.removeItem("user");

		try {
			const { error } = await supabase.auth.signOut();
			
			if (error) {
				console.error("❌ Eroare la deconectare:", error);
			}

			// Reîncărcăm pagina pentru a curăța starea
			setTimeout(() => {
				window.location.reload();
			}, 100);

			return { error };
		} catch (err) {
			console.error("💥 Eroare la deconectare:", err);
			localStorage.clear();
			sessionStorage.clear();
			return { error: err };
		}
	},

	getCurrentUser: async () => {
		try {
			const { data: { user }, error } = await supabase.auth.getUser();

			if (error) {
				console.error("❌ Eroare la obținerea utilizatorului curent:", error);
				return null;
			}

			return user;
		} catch (err) {
			console.error("💥 Eroare la obținerea utilizatorului curent:", err);
			return null;
		}
	},

	resetPassword: async (email: string) => {
		console.log("🔑 Trimitere email pentru resetarea parolei către:", email);

		try {
			const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/auth/reset-password`,
			});

			if (error) {
				console.error("❌ Eroare la trimiterea emailului de resetare:", error);
				return { data: null, error };
			}

			console.log("✅ Email de resetare trimis cu succes");
			return { data, error: null };
		} catch (err) {
			console.error("💥 Eroare la trimiterea emailului de resetare:", err);
			return { data: null, error: err };
		}
	},

	updatePassword: async (newPassword: string) => {
		try {
			console.log("🔐 Actualizare parolă...");

			const { data, error } = await supabase.auth.updateUser({
				password: newPassword,
			});

			if (error) {
				console.error("❌ Eroare la actualizarea parolei:", error);
				return { data: null, error };
			}

			console.log("✅ Parolă actualizată cu succes");
			return { data, error: null };
		} catch (err) {
			console.error("💥 Eroare la actualizarea parolei:", err);
			return { data: null, error: err };
		}
	},
};

// Funcții pentru utilizatori
export const users = {
	getById: async (userId: string) => {
		try {
			const { data, error } = await supabase
				.from("users")
				.select("*")
				.eq("user_id", userId)
				.single();

			return { data, error };
		} catch (err) {
			console.error("Eroare la obținerea utilizatorului:", err);
			return { data: null, error: err };
		}
	},

	update: async (userId: string, updates: Partial<User>) => {
		try {
			const { data, error } = await supabase
				.from("users")
				.update({
					...updates,
					updated_at: new Date().toISOString(),
				})
				.eq("user_id", userId)
				.select();

			return { data, error };
		} catch (err) {
			console.error("Eroare la actualizarea utilizatorului:", err);
			return { data: null, error: err };
		}
	},

	uploadAvatar: async (userId: string, file: File) => {
		try {
			const fileExt = file.name.split(".").pop();
			const fileName = `${uuidv4()}.${fileExt}`;
			const filePath = `${userId}/${fileName}`;

			const { error: uploadError } = await supabase.storage
				.from("profile-images")
				.upload(filePath, file);

			if (uploadError) {
				return { error: uploadError };
			}

			// Obținem URL-ul public pentru avatar
			const { data: { publicUrl } } = supabase.storage
				.from("profile-images")
				.getPublicUrl(filePath);

			// Actualizăm utilizatorul cu noul avatar
			const { data, error } = await supabase
				.from("users")
				.update({ avatar_url: publicUrl })
				.eq("user_id", userId)
				.select();

			return { data, error };
		} catch (err) {
			console.error("Eroare la încărcarea avatarului:", err);
			return { data: null, error: err };
		}
	},
};

// Funcții pentru anunțuri
export const listings = {
	getAll: async (filters?: any) => {
		try {
			console.log("🔍 Obținere toate anunțurile din Supabase...");

			let query = supabase
				.from("listings")
				.select("*")
				.eq("status", "active")
				.order("created_at", { ascending: false });

			if (filters) {
				if (filters.category) query = query.eq("category", filters.category.toLowerCase());
				if (filters.brand) query = query.eq("brand", filters.brand);
				if (filters.priceMin) query = query.gte("price", filters.priceMin);
				if (filters.priceMax) query = query.lte("price", filters.priceMax);
				if (filters.yearMin) query = query.gte("year", filters.yearMin);
				if (filters.yearMax) query = query.lte("year", filters.yearMax);
				if (filters.location) query = query.ilike("location", `%${filters.location}%`);
				if (filters.sellerType) query = query.eq("seller_type", filters.sellerType);
				if (filters.condition) query = query.eq("condition", filters.condition);
				if (filters.fuel) query = query.eq("fuel_type", filters.fuel);
				if (filters.transmission) query = query.eq("transmission", filters.transmission);
				if (filters.engineMin) query = query.gte("engine_capacity", filters.engineMin);
				if (filters.engineMax) query = query.lte("engine_capacity", filters.engineMax);
				if (filters.mileageMax) query = query.lte("mileage", filters.mileageMax);
				if (filters.availability) query = query.eq("availability", filters.availability);
			}

			const { data, error } = await query;

			if (error) {
				console.error("❌ Eroare la obținerea anunțurilor:", error);
				return { data: null, error };
			}

			console.log(`✅ S-au obținut cu succes ${data?.length || 0} anunțuri`);
			return { data, error: null };
		} catch (err) {
			console.error("💥 Eroare în listings.getAll:", err);
			return { data: null, error: err };
		}
	},

	getUserListings: async (userId: string) => {
		try {
			console.log("🔍 Obținere anunțuri utilizator din Supabase...");

			// Obținem utilizatorul pentru a avea seller_id
			const { data: user, error: userError } = await supabase
				.from("users")
				.select("id")
				.eq("user_id", userId)
				.single();

			if (userError || !user) {
				console.error("❌ Eroare la obținerea utilizatorului:", userError);
				return { data: null, error: userError || new Error("Utilizatorul nu a fost găsit") };
			}

			// Obținem toate anunțurile utilizatorului
			const { data, error } = await supabase
				.from("listings")
				.select("*")
				.eq("seller_id", user.id)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("❌ Eroare la obținerea anunțurilor utilizatorului:", error);
				return { data: null, error };
			}

			console.log(`✅ S-au obținut cu succes ${data?.length || 0} anunțuri ale utilizatorului`);
			return { data, error: null };
		} catch (err) {
			console.error("💥 Eroare în listings.getUserListings:", err);
			return { data: null, error: err };
		}
	},

	getById: async (id: string) => {
		try {
			const { data, error } = await supabase
				.from("listings")
				.select("*")
				.eq("id", id)
				.single();

			// Incrementăm numărul de vizualizări
			if (data && !error) {
				await supabase
					.from("listings")
					.update({ views_count: (data.views_count || 0) + 1 })
					.eq("id", id);
			}

			return { data, error };
		} catch (err) {
			console.error("Eroare la obținerea anunțului:", err);
			return { data: null, error: err };
		}
	},

	create: async (listing: Partial<Listing>, images: File[]) => {
		try {
			console.log("🚀 Începe procesul de creare anunț...");

			// 1. Obținem utilizatorul curent
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				throw new Error("Utilizatorul nu este autentificat");
			}

			console.log("👤 Utilizator curent:", user.email);

			// 2. Obținem profilul utilizatorului
			const { data: userProfile, error: userError } = await supabase
				.from("users")
				.select("id, name, seller_type")
				.eq("user_id", user.id)
				.single();

			if (userError || !userProfile) {
				console.error("❌ Profil negăsit:", userError);
				throw new Error("Profilul utilizatorului nu a fost găsit. Te rugăm să-ți completezi profilul mai întâi.");
			}

			console.log("✅ Profil găsit:", userProfile);

			// 3. Încărcăm imaginile în storage (dacă există)
			const imageUrls: string[] = [];

			if (images && images.length > 0) {
				console.log(`📸 Încărcare ${images.length} imagini...`);

				for (const image of images) {
					const fileExt = image.name.split(".").pop();
					const fileName = `${uuidv4()}.${fileExt}`;
					const filePath = `${userProfile.id}/${fileName}`;

					console.log(`📤 Încărcare imagine: ${fileName}`);

					const { error: uploadError, data: uploadData } = await supabase.storage
						.from("listing-images")
						.upload(filePath, image, {
							cacheControl: "3600",
							upsert: false,
						});

					if (uploadError) {
						console.error("❌ Eroare la încărcarea imaginii:", uploadError);
						continue;
					}

					console.log("✅ Imagine încărcată:", uploadData.path);

					// Obținem URL-ul public pentru imagine
					const { data: { publicUrl } } = supabase.storage
						.from("listing-images")
						.getPublicUrl(filePath);

					console.log("🔗 URL public:", publicUrl);
					imageUrls.push(publicUrl);
				}

				console.log(`✅ S-au încărcat cu succes ${imageUrls.length} imagini`);
			}

			// 4. Pregătim datele pentru anunț
			const listingData = {
				...listing,
				id: uuidv4(),
				seller_id: userProfile.id,
				seller_name: userProfile.name,
				seller_type: userProfile.seller_type,
				images: imageUrls,
				status: "pending", // Toate anunțurile încep în așteptare
				views_count: 0,
			};

			console.log("📝 Creare anunț cu datele:", {
				...listingData,
				images: `${imageUrls.length} imagini`,
			});

			// 5. Creăm anunțul în baza de date
			const { data, error } = await supabase
				.from("listings")
				.insert([listingData])
				.select()
				.single();

			if (error) {
				console.error("❌ Eroare la crearea anunțului:", error);
				throw new Error(`Eroare la crearea anunțului: ${error.message}`);
			}

			console.log("✅ Anunț creat cu succes:", data.id);
			return { data, error: null };
		} catch (err: any) {
			console.error("💥 Eroare în listings.create:", err);
			return { data: null, error: err };
		}
	},

	update: async (id: string, updates: Partial<Listing>, newImages?: File[], imagesToRemove?: string[]) => {
		try {
			console.log("🔄 Începe procesul de actualizare anunț...");

			// 1. Obținem anunțul curent
			const { data: currentListing, error: fetchError } = await supabase
				.from("listings")
				.select("images, seller_id, seller_name, status, seller_type, availability")
				.eq("id", id)
				.single();

			if (fetchError || !currentListing) {
				console.error("❌ Eroare la obținerea anunțului curent:", fetchError);
				throw new Error(`Eroare la obținerea anunțului: ${fetchError?.message || "Anunțul nu a fost găsit"}`);
			}

			// 2. Gestionăm imaginile
			let updatedImages = [...(currentListing.images || [])];

			// 2.1 Ștergem imaginile marcate pentru eliminare
			if (imagesToRemove && imagesToRemove.length > 0) {
				console.log(`🗑️ Eliminare ${imagesToRemove.length} imagini...`);
				updatedImages = updatedImages.filter(img => !imagesToRemove.includes(img));

				// Încercăm să ștergem și din storage
				for (const imageUrl of imagesToRemove) {
					try {
						const urlParts = imageUrl.split("/");
						const fileName = urlParts[urlParts.length - 1];
						const sellerFolder = urlParts[urlParts.length - 2];
						const filePath = `${sellerFolder}/${fileName}`;

						await supabase.storage.from("listing-images").remove([filePath]);
						console.log(`✅ Imagine eliminată din storage: ${filePath}`);
					} catch (removeError) {
						console.error("⚠️ Eroare la eliminarea imaginii din storage:", removeError);
					}
				}
			}

			// 2.2 Adăugăm imaginile noi
			if (newImages && newImages.length > 0) {
				console.log(`📸 Încărcare ${newImages.length} imagini noi...`);

				for (const image of newImages) {
					const fileExt = image.name.split(".").pop();
					const fileName = `${uuidv4()}.${fileExt}`;
					const filePath = `${currentListing.seller_id}/${fileName}`;

					console.log(`📤 Încărcare imagine: ${fileName}`);

					const { error: uploadError, data: uploadData } = await supabase.storage
						.from("listing-images")
						.upload(filePath, image, {
							cacheControl: "3600",
							upsert: false,
						});

					if (uploadError) {
						console.error("❌ Eroare la încărcarea imaginii:", uploadError);
						continue;
					}

					console.log("✅ Imagine încărcată:", uploadData.path);

					const { data: { publicUrl } } = supabase.storage
						.from("listing-images")
						.getPublicUrl(filePath);

					console.log("🔗 URL public:", publicUrl);
					updatedImages.push(publicUrl);
				}
			}

			// 3. Actualizăm anunțul
			const updateData = {
				...updates,
				images: updatedImages,
				updated_at: new Date().toISOString(),
				status: "pending", // Orice modificare pune anunțul înapoi în așteptare
			};

			console.log("📝 Actualizare anunț cu datele:", {
				...updateData,
				images: `${updatedImages.length} imagini`,
			});

			const { data, error } = await supabase
				.from("listings")
				.update(updateData)
				.eq("id", id)
				.select();

			if (error) {
				console.error("❌ Eroare la actualizarea anunțului:", error);
				throw new Error(`Eroare la actualizarea anunțului: ${error.message}`);
			}

			console.log("✅ Anunț actualizat cu succes:", id);
			return { data, error: null };
		} catch (error: any) {
			console.error("💥 Eroare în listings.update:", error);
			return { data: null, error: error };
		}
	},

	delete: async (id: string) => {
		try {
			// Obținem anunțul pentru a șterge imaginile
			const { data: listing } = await supabase
				.from("listings")
				.select("images")
				.eq("id", id)
				.single();

			// Ștergem imaginile din storage
			if (listing && listing.images) {
				for (const imageUrl of listing.images) {
					try {
						const urlParts = imageUrl.split("/");
						const fileName = urlParts[urlParts.length - 1];
						const sellerFolder = urlParts[urlParts.length - 2];
						const filePath = `${sellerFolder}/${fileName}`;

						await supabase.storage.from("listing-images").remove([filePath]);
						console.log(`✅ Imagine eliminată din storage: ${filePath}`);
					} catch (error) {
						console.error("Eroare la eliminarea imaginii:", error);
					}
				}
			}

			// Ștergem anunțul
			const { error } = await supabase.from("listings").delete().eq("id", id);
			return { error };
		} catch (err) {
			console.error("Eroare la ștergerea anunțului:", err);
			return { error: err };
		}
	},
};

// Funcții pentru admin
export const admin = {
	isAdmin: async () => {
		try {
			console.log("🔍 Verificare status admin...");

			// Verificăm dacă există un utilizator în localStorage
			const userStr = localStorage.getItem("user");
			if (userStr) {
				try {
					const user = JSON.parse(userStr);
					if (user && user.isAdmin) {
						console.log("✅ Utilizatorul este admin conform localStorage");
						return true;
					}
				} catch (e) {
					console.error("Eroare la parsarea utilizatorului din localStorage:", e);
				}
			}

			const { data: { user } } = await supabase.auth.getUser();

			if (!user) {
				console.log("❌ Niciun utilizator autentificat");
				return false;
			}

			console.log("👤 Verificare status admin pentru utilizatorul:", user.email);

			// Verificare simplă: dacă email-ul este admin@nexar.ro, este admin
			if (user.email === "admin@nexar.ro") {
				console.log("✅ Utilizatorul este admin conform email-ului");
				return true;
			}

			// Încercăm să verificăm în baza de date
			try {
				const { data: userProfile, error: profileError } = await supabase
					.from("users")
					.select("is_admin")
					.eq("user_id", user.id)
					.single();

				if (!profileError && userProfile) {
					console.log("✅ Profil găsit, is_admin:", userProfile.is_admin);
					return userProfile.is_admin || false;
				} else {
					console.log("⚠️ Profil negăsit sau eroare:", profileError);
					return user.email === "admin@nexar.ro";
				}
			} catch (profileError) {
				console.error("⚠️ Eroare la verificarea profilului, folosim fallback email:", profileError);
				return user.email === "admin@nexar.ro";
			}
		} catch (err) {
			console.error("💥 Eroare la verificarea statusului de admin:", err);
			return false;
		}
	},

	getAllListings: async () => {
		try {
			console.log("🔍 Obținere TOATE anunțurile pentru admin...");

			const { data, error } = await supabase
				.from("listings")
				.select(`
					*,
					users!listings_seller_id_fkey (
						name,
						email,
						seller_type,
						verified
					)
				`)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("❌ Eroare la obținerea anunțurilor admin:", error);
				return { data: null, error };
			}

			console.log(`✅ S-au obținut cu succes ${data?.length || 0} anunțuri pentru admin`);
			return { data, error: null };
		} catch (err) {
			console.error("💥 Eroare în admin.getAllListings:", err);
			return { data: null, error: err };
		}
	},

	updateListingStatus: async (listingId: string, status: string) => {
		try {
			console.log("📝 Actualizare status anunț:", listingId, "la", status);

			const { data, error } = await supabase
				.from("listings")
				.update({ status })
				.eq("id", listingId)
				.select();

			if (error) {
				console.error("❌ Eroare la actualizarea statusului anunțului:", error);
				return { data: null, error };
			}

			console.log("✅ Status anunț actualizat cu succes");
			return { data, error: null };
		} catch (err) {
			console.error("💥 Eroare în updateListingStatus:", err);
			return { data: null, error: err };
		}
	},

	deleteListing: async (listingId: string) => {
		try {
			console.log("🗑️ Ștergere anunț:", listingId);

			// Obținem anunțul pentru a șterge imaginile
			const { data: listing } = await supabase
				.from("listings")
				.select("images")
				.eq("id", listingId)
				.single();

			// Ștergem imaginile din storage
			if (listing && listing.images) {
				for (const imageUrl of listing.images) {
					try {
						const urlParts = imageUrl.split("/");
						const fileName = urlParts[urlParts.length - 1];
						const sellerFolder = urlParts[urlParts.length - 2];
						const filePath = `${sellerFolder}/${fileName}`;

						await supabase.storage.from("listing-images").remove([filePath]);
						console.log(`✅ Imagine eliminată din storage: ${filePath}`);
					} catch (error) {
						console.error("Eroare la eliminarea imaginii:", error);
					}
				}
			}

			// Ștergem anunțul
			const { error } = await supabase
				.from("listings")
				.delete()
				.eq("id", listingId);

			if (error) {
				console.error("❌ Eroare la ștergerea anunțului:", error);
				return { error };
			}

			console.log("✅ Anunț șters cu succes");
			return { error: null };
		} catch (err) {
			console.error("💥 Eroare în deleteListing:", err);
			return { error: err };
		}
	},

	getAllUsers: async () => {
		try {
			const { data, error } = await supabase
				.from("users")
				.select("*")
				.order("created_at", { ascending: false });

			return { data, error };
		} catch (err) {
			console.error("Eroare la obținerea utilizatorilor:", err);
			return { data: null, error: err };
		}
	},

	toggleUserStatus: async (userId: string, suspended: boolean) => {
		try {
			const { data, error } = await supabase
				.from("users")
				.update({ suspended })
				.eq("user_id", userId)
				.select();

			return { data, error };
		} catch (err) {
			console.error("Eroare la schimbarea statusului utilizatorului:", err);
			return { data: null, error: err };
		}
	},
};

// Funcție pentru a verifica dacă utilizatorul este autentificat
export const isAuthenticated = async () => {
	try {
		const { data: { user } } = await supabase.auth.getUser();
		return !!user;
	} catch (err) {
		console.error("Eroare la verificarea autentificării:", err);
		return false;
	}
};

// Funcție pentru a verifica dacă Supabase este configurat corect
export const checkSupabaseConnection = async () => {
	try {
		const { error } = await supabase
			.from("users")
			.select("count", { count: "exact", head: true });
		return !error;
	} catch (e) {
		console.error("Eroare de conexiune Supabase:", e);
		return false;
	}
};

// Funcție pentru testarea conexiunii complete
export const testConnection = async () => {
	try {
		console.log("🔍 Testare conexiune Supabase...");

		// Test 1: Conexiunea de bază
		const { data: healthCheck, error: healthError } = await supabase
			.from("users")
			.select("count", { count: "exact", head: true });

		if (healthError) {
			console.error("❌ Verificarea de sănătate a eșuat:", healthError);
			return { success: false, error: "Conexiunea la baza de date a eșuat" };
		}

		console.log("✅ Conexiunea la baza de date reușită");

		// Test 2: Verificăm tabelele
		const tables = ["users", "listings"];
		for (const table of tables) {
			const { error } = await supabase
				.from(table)
				.select("count", { count: "exact", head: true });

			if (error) {
				console.error(`❌ Tabela ${table} nu a fost găsită:`, error);
				return { success: false, error: `Tabela ${table} lipsește` };
			}
			console.log(`✅ Tabela ${table} există`);
		}

		console.log("🎉 Testul de conexiune finalizat cu succes!");
		return {
			success: true,
			message: "Testul de conexiune finalizat - verifică consola pentru detalii",
		};
	} catch (err) {
		console.error("❌ Testul de conexiune a eșuat:", err);
		return { success: false, error: "Eroare neașteptată în timpul testării" };
	}
};