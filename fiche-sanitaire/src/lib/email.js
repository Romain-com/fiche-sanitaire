/**
 * Envoie un email de relance au parent.
 *
 * TODO: Connecter à un service d'envoi d'email (Resend, SendGrid, etc.)
 * Pour l'instant, ouvre le client email via mailto: en fallback.
 */
export async function sendRelanceEmail({ to, code, url, childName }) {
  const subject = `Rappel : Fiche sanitaire de ${childName} à compléter`
  const body = [
    `Bonjour,`,
    ``,
    `Nous vous rappelons que la fiche sanitaire de ${childName} n'a pas encore été complétée.`,
    ``,
    `Vous pouvez la remplir en utilisant le lien suivant :`,
    url,
    ``,
    `Ou en saisissant le code : ${code}`,
    ``,
    `Merci,`,
    `Maison des Enfants - ESF`,
  ].join('\n')

  // TODO: Remplacer par un appel API vers un service d'envoi d'email
  // Exemple avec Resend :
  // const res = await fetch('/api/send-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ to, subject, body }),
  // })
  // if (!res.ok) throw new Error('Erreur envoi email')
  // return

  // Fallback : ouvre le client email
  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.open(mailto, '_blank')
}
