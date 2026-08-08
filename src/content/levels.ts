/** Point de départ de l'apprenant.
 *
 *  Deux chemins seulement : partir de zéro, ou passer le test de placement. Le niveau n'est
 *  plus déclaré « à vue de nez » — soit on ne connaît rien, soit on le mesure. */
export type Level = 'zero' | 'tested'

export const levelOptions: { id: Level; title: string; meta: string }[] = [
  { id: 'zero', title: 'Je pars de zéro', meta: 'Je ne connais aucune lettre' },
  { id: 'tested', title: 'Je connais des lettres', meta: '10 questions pour situer ton niveau' },
]
