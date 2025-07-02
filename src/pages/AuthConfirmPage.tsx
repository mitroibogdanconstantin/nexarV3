import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase"; // asigură-te că importul e corect

const AuthConfirmPage = () => {
	const [isConfirming, setIsConfirming] = useState(true);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const confirmEmail = async () => {
			setIsConfirming(true);
			setError(null);

			// Extragem tokenul manual ca să vedem în consolă
			const urlParams = new URLSearchParams(window.location.search);
			const token = urlParams.get("token");
			const type = urlParams.get("type");

			console.log("Token din URL:", token);
			console.log("Type din URL:", type);

			try {
				// Folosim metoda corectă Supabase pentru confirmare magic link
				const { data, error } = await supabase.auth.getSessionFromUrl({
					storeSession: true,
				});

				if (error) {
					console.error("Eroare la confirmarea email-ului:", error.message);
					setError(
						"Link invalid sau expirat. Te rugăm să soliciți un nou link de confirmare.",
					);
					setIsConfirming(false);
					return;
				}

				if (data.session) {
					console.log("Confirmare reușită:", data.session);
					setIsSuccess(true);
					setIsConfirming(false);
				} else {
					setError("Nu s-a putut confirma contul.");
					setIsConfirming(false);
				}
			} catch (err) {
				console.error("Eroare neașteptată:", err);
				setError("A apărut o eroare neașteptată. Te rugăm să încerci din nou.");
				setIsConfirming(false);
			}
		};

		confirmEmail();
	}, []);

	return (
		<div
			style={{
				padding: 20,
				maxWidth: 600,
				margin: "auto",
				fontFamily: "Arial, sans-serif",
			}}
		>
			<h1>Nexar Logo</h1>

			{isConfirming && <p>Se confirmă email-ul... Te rugăm să aștepți.</p>}

			{isSuccess && (
				<>
					<h2>Cont confirmat cu succes!</h2>
					<p>Bine ai venit! Contul tău Nexar a fost confirmat.</p>
					<Link to="/auth">Conectează-te</Link>
				</>
			)}

			{error && (
				<>
					<h2>Eroare la confirmarea contului</h2>
					<p>{error}</p>
					<Link to="/auth">Încearcă să te conectezi</Link>
				</>
			)}
		</div>
	);
};

export default AuthConfirmPage;
