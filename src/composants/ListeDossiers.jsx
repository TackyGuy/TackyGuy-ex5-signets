import './ListeDossiers.scss';
import Dossier from './Dossier';
import * as crudDossiers from '../services/crud-dossiers';
import { useState, useEffect } from 'react';
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

export default function ListeDossiers({utilisateur, etatDossiers, etatTriage}) {
  // État des dossiers (vient du composant Appli)
  const [dossiers, setDossiers] = etatDossiers;
  const [optionTriage, setOptionTriage] = etatTriage;

  // Lire les dossiers dans Firestore et forcer le réaffichage du composant
  // Remarquez que ce code est dans un useEffect() car on veut l'exécuter 
  // UNE SEULE FOIS (regardez le tableau des 'deps' - dépendances) et ceci 
  // APRÈS l'affichage du composant pour que la requête asynchrone à Firestore  
  // ait eu le temps d'être complétée et le réaffichage du composant soit
  // forcé par la mutation de l'état des dossiers
  useEffect(
    () => 
    {
      crudDossiers.lireTout(utilisateur.uid).then(
        dossiers => setDossiers(dossiers)
      )
    }, []
  );
  useState(
    ()=>
    {
      (etatTriage == 0) ? crudDossiers.lireTout(utilisateur.uid).then(
        dossiers => setDossiers(dossiers))
      : (etatTriage == 1) ? crudDossiers.lireTout2(utilisateur.uid).then(
        dossiers => setDossiers(dossiers))
        : crudDossiers.lireTout3(utilisateur.uid).then(
          dossiers => setDossiers(dossiers))
    }, []
  )

  /**
   * Gérer le clic du bouton 'supprimer' correspondant au dossier identifié en argument
   * @param {string} idd identifiant Firestore du dossier
   */
  async function gererSupprimer(idd) {
    // On fait appel à la méthode supprimer de notre code d'interaction avec Firestore
    crudDossiers.supprimer(utilisateur.uid, idd).then(
      () => {
        const tempDossiers = [...dossiers]; // copier le tableau des dossiers existants
        const dossiersRestants = tempDossiers.filter((elt) => elt.id!==idd); // filtrer pour garder tous les dossiers sauf celui qu'on a demandé de supprimer
        setDossiers(dossiersRestants); // Muter l'état pour forcer le réaffichage du composant
      }).catch(erreur => console.log('Échec de la suppression - Firestore a répondu :', erreur.message));
  }
  
  return (
    <>
    <InputLabel>Trier par...</InputLabel>
    <Select className="boutonTri"
      value={optionTriage}
      onChange={(e) => setOptionTriage(e.target.value)}>
      <MenuItem value={0}>Date de modification descendante</MenuItem>
      <MenuItem value={1}>Nom de dossier alphabétique ascendant</MenuItem>
      <MenuItem value={2}>Nom de dossier alphabétique descendant</MenuItem>
    </Select>
    {console.log({optionTriage})}
    <ul className="ListeDossiers">
      {
        (dossiers.length > 0) ?
          dossiers.map(dossier => <li key={dossier.id}><Dossier {...dossier} gererSupprimer={gererSupprimer} /></li>)
        :
          <li className="msgAucunDossier">
            Votre liste de dossiers est vide 
            <p>;-(</p>
          </li>
      }
    </ul>
    </>
  );
}