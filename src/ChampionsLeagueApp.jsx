import React, { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, Award, Lock, Clock, Edit, Trash2, Plus, Save, ChevronDown, RefreshCw, AlertTriangle, Timer, Vote, Star, Smile, UserCheck, Zap, Eye, EyeOff } from 'lucide-react';
import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  onSnapshot,
  query,
  where,
  updateDoc,
  deleteDoc 
} from 'firebase/firestore';

const ChampionsLeagueApp = () => {
  // Datos iniciales de equipos y participantes
  const teams = [
  { team: 'Liverpool', player: 'Daniel Acero' },
  { team: 'Borussia Dortmund', player: 'Miguel Ochoa' },
  { team: 'Chelsea', player: 'Jero Martinez' }, 
  { team: 'FC Barcelona', player: 'Andrés Villamizar' },
  { team: 'Manchester City', player: 'Santiago Bernal' },
  { team: 'Atlético de Madrid', player: 'Sergio Sanchez' },
  { team: 'Arsenal', player: 'Fabian Murillo' }, 
  { team: 'PSG', player: 'Daniel Alzate' }, 
  { team: 'Real Madrid', player: 'German Meek' }, 
  { team: 'Tottenham Hotspurs', player: 'Felipe Murillo' },
  { team: 'Inter de Milan', player: 'Julian Vallejo' }, 
  { team: 'AC Milan', player: 'Nayo Pardo' },
  { team: 'Bayern Munich', player: 'Steban Meek' },
  { team: 'Juventus', player: 'JP Garzon' }
  ];

  const players = teams.map(t => t.player);

  // Estados principales
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [activeSection, setActiveSection] = useState('predicciones');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [classificationTab, setClassificationTab] = useState('predicciones');
  
  // Estados de datos
  const [groups, setGroups] = useState({});
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [userPoints, setUserPoints] = useState({});
  const [arrivals, setArrivals] = useState({});
  
  // Estados de visibilidad (controlados desde Firebase)
  const [visibility, setVisibility] = useState({
    groups: true,      // Siempre visible por defecto
    predictions: false,
    results: false,
    standings: false,
    voting: false
  });
  
  // Estados de votaciones
  const [goals, setGoals] = useState([]);
  const [activeVoting, setActiveVoting] = useState(null); // 'best_goal', 'most_quiet', 'funniest', 'revelation', 'ballon_dor'
  const [votingStartTime, setVotingStartTime] = useState(null);
  const [votes, setVotes] = useState({});
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);
  
  // Estados de admin
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedTeamsForGroup, setSelectedTeamsForGroup] = useState([]);
  const [editingMatch, setEditingMatch] = useState(null);
  const [selectedPlayerForArrival, setSelectedPlayerForArrival] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');

  // Cargar datos al iniciar
  useEffect(() => {
    loadData();
  }, []);
  
  // Cargar predicciones cuando un usuario hace login
  useEffect(() => {
    if (currentUser && !isAdmin) {
      loadUserPredictions(currentUser);
    } else if (isAdmin) {
      loadAllPredictions();
    }
  }, [currentUser, isAdmin]);

  // Inicializar sección correcta según el tipo de usuario
  useEffect(() => {
    if (isAdmin) {
      setActiveSection('admin');
    } else if (currentUser) {
      setActiveSection('predicciones');
    }
  }, [isAdmin, currentUser]);

  // Obtener equipos ya asignados a grupos
  const getAssignedTeams = () => {
    const assigned = [];
    Object.values(groups).forEach(groupTeams => {
      assigned.push(...groupTeams);
    });
    return assigned;
  };

  // Función para cargar datos desde Firebase
  // ==================== FIRESTORE FUNCTIONS ====================
  
  // Cargar configuración de visibilidad desde Firebase
  const loadVisibility = async () => {
    try {
      const visibilityRef = doc(db, 'settings', 'visibility');
      const visibilitySnap = await getDoc(visibilityRef);
      
      if (visibilitySnap.exists()) {
        setVisibility(visibilitySnap.data());
        console.log('👁️ Visibilidad cargada:', visibilitySnap.data());
      } else {
        // Crear documento de visibilidad por defecto
        const defaultVisibility = {
          groups: true,
          predictions: false,
          results: false,
          standings: false,
          voting: false
        };
        await setDoc(visibilityRef, defaultVisibility);
        setVisibility(defaultVisibility);
        console.log('👁️ Visibilidad creada con valores por defecto');
      }
    } catch (error) {
      console.error('❌ Error al cargar visibilidad:', error);
    }
  };

  // Actualizar visibilidad (solo admin)
  const updateVisibility = async (key, value) => {
    if (!isAdmin) {
      alert('Solo el administrador puede cambiar la visibilidad');
      return;
    }
    
    try {
      const visibilityRef = doc(db, 'settings', 'visibility');
      await setDoc(visibilityRef, { [key]: value }, { merge: true });
      setVisibility(prev => ({ ...prev, [key]: value }));
      console.log(`✅ Visibilidad actualizada: ${key} = ${value}`);
    } catch (error) {
      console.error('❌ Error al actualizar visibilidad:', error);
      alert('Error al actualizar visibilidad');
    }
  };

  // Cargar datos generales (grupos, partidos, puntos, etc.)
  const loadData = async () => {
    try {
      console.log('📥 Cargando datos desde Firestore...');
      
      // Cargar visibilidad
      await loadVisibility();
      
      // Cargar grupos
      const groupsRef = doc(db, 'data', 'groups');
      const groupsSnap = await getDoc(groupsRef);
      if (groupsSnap.exists()) {
        setGroups(groupsSnap.data().groups || {});
      }
      
      // Cargar partidos
      const matchesRef = doc(db, 'data', 'matches');
      const matchesSnap = await getDoc(matchesRef);
      if (matchesSnap.exists()) {
        setMatches(matchesSnap.data().matches || []);
      }
      
      // Cargar puntos de usuarios
      const pointsRef = doc(db, 'data', 'userPoints');
      const pointsSnap = await getDoc(pointsRef);
      if (pointsSnap.exists()) {
        setUserPoints(pointsSnap.data().points || {});
      }
      
      // Cargar llegadas
      const arrivalsRef = doc(db, 'data', 'arrivals');
      const arrivalsSnap = await getDoc(arrivalsRef);
      if (arrivalsSnap.exists()) {
        setArrivals(arrivalsSnap.data().arrivals || {});
      }
      
      // Cargar goles
      const goalsRef = doc(db, 'data', 'goals');
      const goalsSnap = await getDoc(goalsRef);
      if (goalsSnap.exists()) {
        setGoals(goalsSnap.data().goals || []);
      }
      
      // Cargar votaciones
      const votesRef = doc(db, 'data', 'votes');
      const votesSnap = await getDoc(votesRef);
      if (votesSnap.exists()) {
        setVotes(votesSnap.data().votes || {});
        setActiveVoting(votesSnap.data().activeVoting || null);
        setVotingStartTime(votesSnap.data().votingStartTime || null);
      }
      
      console.log('✅ Datos generales cargados exitosamente');
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
    }
  };
  
  // Cargar predicciones de todos los usuarios
  const loadAllPredictions = async () => {
    try {
      console.log('📥 Cargando predicciones desde Firestore...');
      const predictionsRef = collection(db, 'predictions');
      const predictionsSnap = await getDocs(predictionsRef);
      
      const allPredictions = {};
      predictionsSnap.forEach((doc) => {
        const docId = doc.id; // formato: userId_matchId
        const [userId, matchId] = docId.split('_');
        
        if (!allPredictions[userId]) {
          allPredictions[userId] = {};
        }
        allPredictions[userId][matchId] = doc.data();
      });
      
      setPredictions(allPredictions);
      console.log('📊 Total de predicciones cargadas:', Object.keys(allPredictions).length);
      Object.keys(allPredictions).forEach(player => {
        const predCount = Object.keys(allPredictions[player] || {}).length;
        console.log(`  ✅ ${player}: ${predCount} predicción(es)`);
      });
    } catch (error) {
      console.error('❌ Error al cargar predicciones:', error);
    }
  };
  
  // Cargar predicciones de un usuario específico
  const loadUserPredictions = async (userId) => {
    try {
      console.log(`📥 Cargando predicciones de ${userId}...`);
      const predictionsRef = collection(db, 'predictions');
      const q = query(predictionsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const userPreds = {};
      querySnapshot.forEach((doc) => {
        const docId = doc.id;
        const matchId = docId.split('_')[1];
        userPreds[matchId] = doc.data();
      });
      
      setPredictions(prev => ({
        ...prev,
        [userId]: userPreds
      }));
      
      console.log(`✅ ${Object.keys(userPreds).length} predicciones cargadas para ${userId}`);
    } catch (error) {
      console.error(`❌ Error al cargar predicciones de ${userId}:`, error);
    }
  };

// Guardar grupos
const saveGroups = async () => {
  try {
    const groupsRef = doc(db, 'data', 'groups');
    await setDoc(groupsRef, { groups }, { merge: true });
    console.log('✅ Grupos guardados');
    return true;
  } catch (error) {
    console.error('❌ Error al guardar grupos:', error);
    return false;
  }
};

// Guardar partidos
const saveMatches = async () => {
  try {
    const matchesRef = doc(db, 'data', 'matches');
    await setDoc(matchesRef, { matches }, { merge: true });
    console.log('✅ Partidos guardados');
    return true;
  } catch (error) {
    console.error('❌ Error al guardar partidos:', error);
    return false;
  }
};

// Guardar puntos de usuarios
const saveUserPoints = async () => {
  try {
    const pointsRef = doc(db, 'data', 'userPoints');
    await setDoc(pointsRef, { points: userPoints }, { merge: true });
    console.log('✅ Puntos guardados');
    return true;
  } catch (error) {
    console.error('❌ Error al guardar puntos:', error);
    return false;
  }
};

// Guardar llegadas
const saveArrivals = async () => {
  try {
    const arrivalsRef = doc(db, 'data', 'arrivals');
    await setDoc(arrivalsRef, { arrivals }, { merge: true });
    console.log('✅ Llegadas guardadas');
    return true;
  } catch (error) {
    console.error('❌ Error al guardar llegadas:', error);
    return false;
  }
};

// Guardar goles
const saveGoals = async () => {
  try {
    const goalsRef = doc(db, 'data', 'goals');
    await setDoc(goalsRef, { goals }, { merge: true });
    console.log('✅ Goles guardados');
    return true;
  } catch (error) {
    console.error('❌ Error al guardar goles:', error);
    return false;
  }
};

// Guardar votaciones
const saveVotes = async () => {
  try {
    const votesRef = doc(db, 'data', 'votes');
    await setDoc(votesRef, { 
      votes, 
      activeVoting, 
      votingStartTime 
    }, { merge: true });
    console.log('✅ Votaciones guardadas');
    return true;
  } catch (error) {
    console.error('❌ Error al guardar votaciones:', error);
    return false;
  }
};

// Función unificada para guardar todos los datos (reemplaza saveData antigua)
const saveAllData = async () => {
  console.log('💾 Guardando todos los datos en Firestore...');
  
  try {
    await Promise.all([
      saveGroups(),
      saveMatches(),
      saveUserPoints(),
      saveArrivals(),
      saveGoals(),
      saveVotes()
    ]);
    
    console.log('✅ Todos los datos guardados exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al guardar datos:', error);
    alert('Error al guardar datos. Intenta de nuevo.');
    return false;
  }
};

  // Función para sincronizar manualmente con Firebase
  const manualSync = async () => {
    const success = await saveAllData();
    if (success) {
      alert('✅ Datos sincronizados exitosamente!');
      // Recargar predicciones
      if (currentUser && !isAdmin) {
        await loadUserPredictions(currentUser);
      } else if (isAdmin) {
        await loadAllPredictions();
      }
    }
  };

  // Restablecer sistema completo
  const resetSystem = async () => {
    setGroups({});
    setMatches([]);
    setPredictions({});
    setUserPoints({});
    setArrivals({});
    setGoals([]);
    setVotes({});
    setActiveVoting(null);
    setShowResetConfirm(false);
    await saveAllData();
    alert('Sistema restablecido exitosamente');
  };

  // Registrar hora de llegada
  const registerArrival = async () => {
    if (!selectedPlayerForArrival || !arrivalTime) {
      alert('Selecciona un jugador e ingresa la hora de llegada');
      return;
    }
    
    const newArrivals = { ...arrivals };
    newArrivals[selectedPlayerForArrival] = arrivalTime;
    setArrivals(newArrivals);
    setSelectedPlayerForArrival('');
    setArrivalTime('');
    await saveAllData();
    alert('Hora de llegada registrada exitosamente');
  };

  // Gestión de goles
  const addGoal = async () => {
    if (!newGoalDescription.trim()) {
      alert('Debes ingresar una descripción del gol');
      return;
    }
    
    const newGoal = {
      id: Date.now(),
      description: newGoalDescription
    };
    
    setGoals([...goals, newGoal]);
    setNewGoalDescription('');
    await saveAllData();
    alert('Gol agregado exitosamente');
  };

  const updateGoal = async (goalId, newDescription) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, description: newDescription } : g));
    setEditingGoal(null);
    await saveAllData();
    alert('Gol actualizado exitosamente');
  };

  const deleteGoal = async (goalId) => {
    setGoals(goals.filter(g => g.id !== goalId));
    await saveAllData();
  };

  // Habilitar votación
  const enableVoting = async (votingType) => {
    setActiveVoting(votingType);
    setVotingStartTime(Date.now());
    await saveAllData();
  };

  // Deshabilitar votación
  const disableVoting = async () => {
    setActiveVoting(null);
    setVotingStartTime(null);
    await saveAllData();
  };

  // Verificar si puede votar
  const canVote = () => {
    if (!activeVoting || !votingStartTime) return false;
    const timeElapsed = (Date.now() - votingStartTime) / 1000 / 60;
    return timeElapsed <= 3;
  };

  // Enviar voto
  const submitVote = async (votingType, voteData) => {
    if (!canVote()) {
      alert('El tiempo para votar ha expirado');
      return;
    }
    
    const newVotes = { ...votes };
    if (!newVotes[currentUser]) {
      newVotes[currentUser] = {};
    }
    
    newVotes[currentUser][votingType] = voteData;
    setVotes(newVotes);
    await saveAllData();
    alert('Voto registrado exitosamente');
  };

  // Calcular resultados de votaciones
  const calculateVotingResults = (votingType) => {
    const results = {};
    
    if (votingType === 'best_goal' || votingType === 'ballon_dor') {
      // Sistema de puntos para top 3
      Object.values(votes).forEach(userVotes => {
        if (userVotes[votingType]) {
          const { first, second, third } = userVotes[votingType];
          
          if (first) {
            results[first] = (results[first] || 0) + 5;
          }
          if (second) {
            results[second] = (results[second] || 0) + 3;
          }
          if (third) {
            results[third] = (results[third] || 0) + 1;
          }
        }
      });
    } else {
      // Conteo simple de votos
      Object.values(votes).forEach(userVotes => {
        if (userVotes[votingType]) {
          const vote = userVotes[votingType];
          results[vote] = (results[vote] || 0) + 1;
        }
      });
    }
    
    return Object.entries(results).sort(([,a], [,b]) => b - a);
  };

  // Login Usuario
  const handleUserLogin = () => {
    if (selectedPlayer && players.includes(selectedPlayer)) {
      setCurrentUser(selectedPlayer);
      setIsAdmin(false);
      if (!userPoints[selectedPlayer]) {
        setUserPoints(prev => ({ ...prev, [selectedPlayer]: 0 }));
      }
    } else {
      alert('Por favor selecciona un jugador válido');
    }
  };

  // Login Admin
  const handleAdminLogin = () => {
    if (adminPassword === 'MrChampions') {
      setIsAdmin(true);
      setCurrentUser('Administrador');
      setShowAdminLogin(false);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setSelectedPlayer('');
    setAdminPassword('');
    setShowAdminLogin(false);
  };

  // Generar partidos automáticamente para un grupo
  const generateGroupMatches = (groupName, groupTeams) => {
    const newMatches = [];
    
    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        const match = {
          id: Date.now() + Math.random(),
          group: groupName,
          phase: 'group',
          team1: teams.find(t => t.team === groupTeams[i]),
          team2: teams.find(t => t.team === groupTeams[j]),
          enabled: false,
          enabledAt: null,
          result: null,
          firstGoalScorer: null
        };
        newMatches.push(match);
      }
    }
    
    return newMatches;
  };

  // Crear grupo
  const createGroup = async () => {
    if (!newGroupName || selectedTeamsForGroup.length === 0) {
      alert('Debes ingresar un nombre de grupo y seleccionar equipos');
      return;
    }
    
    const assignedTeams = getAssignedTeams();
    const duplicates = selectedTeamsForGroup.filter(t => assignedTeams.includes(t));
    if (duplicates.length > 0) {
      alert(`Los siguientes equipos ya están asignados: ${duplicates.join(', ')}`);
      return;
    }
    
    const newGroups = { ...groups, [newGroupName]: selectedTeamsForGroup };
    setGroups(newGroups);
    
    const groupMatches = generateGroupMatches(newGroupName, selectedTeamsForGroup);
    setMatches([...matches, ...groupMatches]);
    
    setNewGroupName('');
    setSelectedTeamsForGroup([]);
    await saveGroups(); await saveMatches();
    alert(`Grupo ${newGroupName} creado con ${groupMatches.length} partidos generados`);
  };

  const toggleTeamSelection = (team) => {
    if (selectedTeamsForGroup.includes(team)) {
      setSelectedTeamsForGroup(selectedTeamsForGroup.filter(t => t !== team));
    } else {
      setSelectedTeamsForGroup([...selectedTeamsForGroup, team]);
    }
  };

  const deleteGroup = async (groupName) => {
    const newGroups = { ...groups };
    delete newGroups[groupName];
    setGroups(newGroups);
    
    setMatches(matches.filter(m => m.group !== groupName));
    await saveAllData();
  };

  // Crear partido manual
  const createMatch = async (group, team1, team2, phase = 'group') => {
    const newMatch = {
      id: Date.now(),
      group,
      phase,
      team1: teams.find(t => t.team === team1),
      team2: teams.find(t => t.team === team2),
      enabled: false,
      enabledAt: null,
      result: null,
      firstGoalScorer: null
    };
    
    setMatches([...matches, newMatch]);
    await saveAllData();
  };

  // Habilitar partido
  const enableMatch = async (matchId) => {
    setMatches(matches.map(m => 
      m.id === matchId 
        ? { ...m, enabled: true, enabledAt: Date.now() }
        : m
    ));
    await saveAllData();
  };

  // Eliminar partido
  const deleteMatch = async (matchId) => {
    setMatches(matches.filter(m => m.id !== matchId));
    
    const newPredictions = { ...predictions };
    Object.keys(newPredictions).forEach(player => {
      if (newPredictions[player][matchId]) {
        delete newPredictions[player][matchId];
      }
    });
    setPredictions(newPredictions);
    await saveAllData();
  };

  // Registrar resultado del partido
  const registerResult = async (matchId, winner, score1, score2, firstScorer) => {
    console.log('🔍 DEBUG: Registrando resultado del partido', matchId);
    console.log('📊 Predicciones ANTES de registrar:', JSON.parse(JSON.stringify(predictions)));
    
    // Actualizar el partido con el resultado
    const updatedMatches = matches.map(m => 
      m.id === matchId 
        ? { 
            ...m, 
            enabled: false,
            result: { winner, score1: parseInt(score1), score2: parseInt(score2) },
            firstGoalScorer: firstScorer
          }
        : m
    );
    
    setMatches(updatedMatches);
    
    console.log('🎯 Partido actualizado:', updatedMatches.find(m => m.id === matchId));
    
    // Recalcular puntos INMEDIATAMENTE con los datos actualizados
    const newPoints = {};
    
    players.forEach(player => {
      newPoints[player] = 0;
    });
    
    updatedMatches.forEach(match => {
      if (match.result) {
        Object.keys(predictions).forEach(player => {
          if (predictions[player] && predictions[player][match.id]) {
            const pred = predictions[player][match.id];
            let points = 0;
            
            // 3 puntos por acertar ganador
            if (pred.winner === match.result.winner) {
              points += 3;
            }
            
            // 1 punto por acertar primer goleador
            if (pred.firstScorer === match.firstGoalScorer) {
              points += 1;
            }
            
            // 5 puntos por acertar resultado exacto
            if (pred.score1 === match.result.score1 && pred.score2 === match.result.score2) {
              points += 5;
            }
            
            newPoints[player] = (newPoints[player] || 0) + points;
          }
        });
      }
    });
    
    console.log('💰 Nuevos puntos calculados:', newPoints);
    
    setUserPoints(newPoints);
    
    console.log('📊 Predicciones DESPUÉS de registrar:', JSON.parse(JSON.stringify(predictions)));
    console.log('⚠️ IMPORTANTE: Las predicciones NO deberían cambiar entre ANTES y DESPUÉS');
    
    // Guardar en Firebase
    await saveAllData();
    alert('✅ Resultado registrado y puntos calculados exitosamente!');
  };

  // Recalcular todos los puntos
  const recalculateAllPoints = () => {
    const newPoints = {};
    
    players.forEach(player => {
      newPoints[player] = 0;
    });
    
    matches.forEach(match => {
      if (match.result) {
        Object.keys(predictions).forEach(player => {
          if (predictions[player][match.id]) {
            const pred = predictions[player][match.id];
            let points = 0;
            
            if (pred.winner === match.result.winner) {
              points += 3;
            }
            
            if (pred.firstScorer === match.firstGoalScorer) {
              points += 1;
            }
            
            if (pred.score1 === match.result.score1 && pred.score2 === match.result.score2) {
              points += 5;
            }
            
            newPoints[player] = (newPoints[player] || 0) + points;
          }
        });
      }
    });
    
    setUserPoints(newPoints);
  };


  // Calcular puntos individuales para un partido específico
  const calculateMatchPoints = (match, playerName) => {
    if (!match.result || !predictions[playerName] || !predictions[playerName][match.id]) {
      return { total: 0, details: {} };
    }
    
    const pred = predictions[playerName][match.id];
    const details = {
      winner: false,
      score: false,
      firstScorer: false
    };
    let total = 0;
    
    // 3 puntos por acertar ganador
    if (pred.winner === match.result.winner) {
      details.winner = true;
      total += 3;
    }
    
    // 1 punto por acertar primer goleador
    if (pred.firstScorer === match.firstGoalScorer) {
      details.firstScorer = true;
      total += 1;
    }
    
    // 5 puntos por acertar resultado exacto
    if (pred.score1 === match.result.score1 && pred.score2 === match.result.score2) {
      details.score = true;
      total += 5;
    }
    
    return { total, details };
  };

  // Predicción de usuario
  // ==================== GUARDAR PREDICCIÓN (CORRECTO) ====================
  const submitPrediction = async (matchId, winner, score1, score2, firstScorer) => {
    console.log('🎯 Guardando predicción...');
    console.log('👤 Usuario:', currentUser);
    console.log('⚽ Partido:', matchId);
    console.log('📊 Datos:', { winner, score1, score2, firstScorer });
    
    if (!currentUser) {
      alert('Debes seleccionar un usuario primero');
      return;
    }
    
    const match = matches.find(m => m.id === matchId);
    if (!match) {
      alert('Partido no encontrado');
      return;
    }
    
    const timeElapsed = (Date.now() - match.enabledAt) / 1000 / 60;
    if (timeElapsed > 3) {
      alert('El tiempo para predecir ha expirado');
      return;
    }
    
    // Validar que todos los campos estén llenos
    if (!winner || !score1 || !score2 || !firstScorer) {
      alert('Debes completar todos los campos');
      return;
    }
    
    try {
      // CRÍTICO: Crear ID del documento como userId_matchId
      const docId = `${currentUser}_${matchId}`;
      const predictionRef = doc(db, 'predictions', docId);
      
      const predictionData = {
        userId: currentUser,
        matchId: matchId,
        winner: winner,
        score1: parseInt(score1),
        score2: parseInt(score2),
        firstScorer: firstScorer,
        timestamp: Date.now(),
        savedAt: new Date().toISOString()
      };
      
      console.log('💾 Guardando en Firestore...');
      console.log('📄 Doc ID:', docId);
      console.log('📊 Data:', predictionData);
      
      // USAR setDoc con merge:true para crear o actualizar
      await setDoc(predictionRef, predictionData, { merge: true });
      
      console.log('✅ Predicción guardada en Firestore exitosamente');
      
      // Actualizar estado local
      const newPredictions = { ...predictions };
      if (!newPredictions[currentUser]) {
        newPredictions[currentUser] = {};
      }
      newPredictions[currentUser][matchId] = predictionData;
      setPredictions(newPredictions);
      
      alert('✅ Predicción guardada exitosamente');
      
      // Recargar predicciones para asegurar sincronización
      await loadUserPredictions(currentUser);
      
    } catch (error) {
      console.error('❌ Error al guardar predicción:', error);
      console.error('❌ Detalles del error:', error.message);
      alert('Error al guardar predicción: ' + error.message);
    }
  };

  // Verificar si puede editar
  const canEditPrediction = (matchId) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || !match.enabledAt) return false;
    
    const timeElapsed = (Date.now() - match.enabledAt) / 1000 / 60;
    return timeElapsed <= 3;
  };

  // Calcular clasificación por grupos
  const calculateGroupStandings = (groupName) => {
    const groupTeams = groups[groupName];
    if (!groupTeams) return [];
    
    const standings = {};
    groupTeams.forEach(teamName => {
      standings[teamName] = {
        team: teamName,
        player: teams.find(t => t.team === teamName).player,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        directMatches: {}
      };
    });
    
    const groupMatches = matches.filter(m => m.group === groupName && m.result);
    
    groupMatches.forEach(match => {
      const team1Name = match.team1.team;
      const team2Name = match.team2.team;
      const score1 = match.result.score1;
      const score2 = match.result.score2;
      
      standings[team1Name].played++;
      standings[team2Name].played++;
      standings[team1Name].goalsFor += score1;
      standings[team1Name].goalsAgainst += score2;
      standings[team2Name].goalsFor += score2;
      standings[team2Name].goalsAgainst += score1;
      
      if (score1 > score2) {
        standings[team1Name].won++;
        standings[team1Name].points += 3;
        standings[team2Name].lost++;
      } else if (score2 > score1) {
        standings[team2Name].won++;
        standings[team2Name].points += 3;
        standings[team1Name].lost++;
      } else {
        standings[team1Name].drawn++;
        standings[team2Name].drawn++;
        standings[team1Name].points += 1;
        standings[team2Name].points += 1;
      }
      
      if (!standings[team1Name].directMatches[team2Name]) {
        standings[team1Name].directMatches[team2Name] = {
          points: 0,
          goalsFor: 0,
          goalsAgainst: 0
        };
      }
      if (!standings[team2Name].directMatches[team1Name]) {
        standings[team2Name].directMatches[team1Name] = {
          points: 0,
          goalsFor: 0,
          goalsAgainst: 0
        };
      }
      
      standings[team1Name].directMatches[team2Name].goalsFor += score1;
      standings[team1Name].directMatches[team2Name].goalsAgainst += score2;
      standings[team2Name].directMatches[team1Name].goalsFor += score2;
      standings[team2Name].directMatches[team1Name].goalsAgainst += score1;
      
      if (score1 > score2) {
        standings[team1Name].directMatches[team2Name].points += 3;
      } else if (score2 > score1) {
        standings[team2Name].directMatches[team1Name].points += 3;
      } else {
        standings[team1Name].directMatches[team2Name].points += 1;
        standings[team2Name].directMatches[team1Name].points += 1;
      }
    });
    
    Object.values(standings).forEach(team => {
      team.goalDifference = team.goalsFor - team.goalsAgainst;
    });
    
    const sortedStandings = Object.values(standings).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      
      const directPointsA = a.directMatches[b.team]?.points || 0;
      const directPointsB = b.directMatches[a.team]?.points || 0;
      if (directPointsB !== directPointsA) return directPointsB - directPointsA;
      
      const directGDA = (a.directMatches[b.team]?.goalsFor || 0) - (a.directMatches[b.team]?.goalsAgainst || 0);
      const directGDB = (b.directMatches[a.team]?.goalsFor || 0) - (b.directMatches[a.team]?.goalsAgainst || 0);
      if (directGDB !== directGDA) return directGDB - directGDA;
      
      const directGFA = a.directMatches[b.team]?.goalsFor || 0;
      const directGFB = b.directMatches[a.team]?.goalsFor || 0;
      return directGFB - directGFA;
    });
    
    return sortedStandings;
  };

  // Pantalla de Login
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a2332 0%, #0a0e1a 100%)' }}>
        <div className="w-full max-w-2xl px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Trophy className="w-16 h-16" style={{ color: '#FFD700' }} />
              <h1 className="text-6xl font-bold" style={{ color: '#FFD700', letterSpacing: '2px' }}>
                CHAMPIONS LEAGUE
              </h1>
            </div>
            <p className="text-xl text-gray-400">Sistema de Predicciones</p>
            <div className="h-1 w-full mt-6" style={{ background: '#FFD700' }}></div>
          </div>

          <div className="bg-gray-900 rounded-3xl p-8 border-2" style={{ borderColor: '#1a2540' }}>
            {!showAdminLogin ? (
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex items-center gap-4 bg-gray-800 rounded-xl p-4 border-2 border-gray-700 hover:border-gray-600 transition-all">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#FFD700' }}>
                      <Users className="w-6 h-6" style={{ color: '#05080F' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: '#FFD700' }}>Selecciona tu nombre</p>
                      <select
                        value={selectedPlayer}
                        onChange={(e) => setSelectedPlayer(e.target.value)}
                        className="w-full bg-transparent text-white text-lg font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="" style={{ background: '#1F2937' }}>Haz clic para elegir tu usuario</option>
                        {players.map((player, idx) => (
                          <option key={idx} value={player} style={{ background: '#1F2937' }}>{player}</option>
                        ))}
                      </select>
                    </div>
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  </div>
                </div>

                <button
                  onClick={handleUserLogin}
                  disabled={!selectedPlayer}
                  className="w-full py-4 rounded-xl font-bold text-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: selectedPlayer ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : '#4a5568',
                    color: '#05080F',
                    boxShadow: selectedPlayer ? '0 8px 20px rgba(255, 215, 0, 0.3)' : 'none'
                  }}
                >
                  INGRESAR
                </button>

                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-3"
                  style={{ 
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <Lock className="w-5 h-5" />
                  Acceso Administrador
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Lock className="w-16 h-16 mx-auto mb-4" style={{ color: '#FFD700' }} />
                  <h3 className="text-2xl font-bold text-white">Acceso Administrador</h3>
                  <p className="text-gray-400 mt-2">Ingresa la contraseña de administrador</p>
                </div>

                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full p-4 rounded-xl bg-gray-800 text-white border-2 border-gray-700 focus:outline-none focus:border-yellow-400 text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleAdminLogin}
                    className="flex-1 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
                    style={{ 
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      color: '#05080F'
                    }}
                  >
                    INGRESAR
                  </button>
                  <button
                    onClick={() => setShowAdminLogin(false)}
                    className="flex-1 py-4 rounded-xl font-bold text-lg bg-gray-700 text-white hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Panel Principal
  return (
    <div className="min-h-screen" style={{ background: '#05080F' }}>
      {/* Header */}
      <div className="bg-gray-900 border-b-2" style={{ borderColor: '#FFD700' }}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Trophy className="w-10 h-10" style={{ color: '#FFD700' }} />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#FFD700' }}>CHAMPIONS LEAGUE</h1>
              <p className="text-sm text-gray-400">Predicciones 2025-2</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-white font-semibold">{currentUser}</p>
              {!isAdmin && (
                <>
                  <p className="text-sm" style={{ color: '#FFD700' }}>
                    {userPoints[currentUser] || 0} puntos
                  </p>
                  {arrivals[currentUser] && (
                    <p className="text-xs text-gray-400 flex items-center justify-end gap-1">
                      <Timer className="w-3 h-3" />
                      Llegada: {arrivals[currentUser]}
                    </p>
                  )}
                </>
              )}
              {isAdmin && (
                <p className="text-sm" style={{ color: '#FFD700' }}>Administrador</p>
              )}
            </div>
            <button
              onClick={manualSync}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              title="Sincronizar con Firebase"
            >
              <RefreshCw className="w-4 h-4" />
              Sync
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-900 border-b" style={{ borderColor: '#FFD700' }}>
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            {!isAdmin && visibility.predictions && (
              <button
                onClick={() => setActiveSection('predicciones')}
                className={`px-6 py-3 font-semibold ${activeSection === 'predicciones' ? 'border-b-4' : 'text-gray-400'}`}
                style={activeSection === 'predicciones' ? { color: '#FFD700', borderColor: '#FFD700' } : {}}
              >
                <Calendar className="inline w-5 h-5 mr-2" />
                Predicciones
              </button>
            )}

            {/* Votaciones - SIEMPRE visible para usuarios */}
            {!isAdmin && (
              <button
                onClick={() => setActiveSection('votaciones')}
                className={`px-6 py-3 font-semibold ${activeSection === 'votaciones' ? 'border-b-4' : 'text-gray-400'}`}
                style={activeSection === 'votaciones' ? { color: '#FFD700', borderColor: '#FFD700' } : {}}
              >
                <Vote className="inline w-5 h-5 mr-2" />
                Votaciones
              </button>
            )}
            
            {visibility.results && (
              <button
                onClick={() => setActiveSection('resultados')}
                className={`px-6 py-3 font-semibold ${activeSection === 'resultados' ? 'border-b-4' : 'text-gray-400'}`}
                style={activeSection === 'resultados' ? { color: '#FFD700', borderColor: '#FFD700' } : {}}
              >
                <Award className="inline w-5 h-5 mr-2" />
                Resultados
              </button>
            )}
            
            {/* Clasificación - SIEMPRE visible */}
            <button
              onClick={() => setActiveSection('clasificacion')}
              className={`px-6 py-3 font-semibold ${activeSection === 'clasificacion' ? 'border-b-4' : 'text-gray-400'}`}
              style={activeSection === 'clasificacion' ? { color: '#FFD700', borderColor: '#FFD700' } : {}}
            >
              <Users className="inline w-5 h-5 mr-2" />
              Clasificación
            </button>
            
            {isAdmin && (
              <button
                onClick={() => setActiveSection('verpredicciones')}
                className={`px-6 py-3 font-semibold ${activeSection === 'verpredicciones' ? 'border-b-4' : 'text-gray-400'}`}
                style={activeSection === 'verpredicciones' ? { color: '#FFD700', borderColor: '#FFD700' } : {}}
              >
                <Edit className="inline w-5 h-5 mr-2" />
                Ver Predicciones
              </button>
            )}
            
            {isAdmin && (
              <button
                onClick={() => setActiveSection('admin')}
                className={`px-6 py-3 font-semibold ${activeSection === 'admin' ? 'border-b-4' : 'text-gray-400'}`}
                style={activeSection === 'admin' ? { color: '#FFD700', borderColor: '#FFD700' } : {}}
              >
                <Lock className="inline w-5 h-5 mr-2" />
                Administración
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeSection === 'predicciones' && !isAdmin && (
          <PredictionsSection
            matches={matches}
            currentUser={currentUser}
            predictions={predictions}
            canEditPrediction={canEditPrediction}
            submitPrediction={submitPrediction}
            calculateMatchPoints={calculateMatchPoints}
          />
        )}

        {activeSection === 'votaciones' && !isAdmin && (
          <VotingSection
            activeVoting={activeVoting}
            canVote={canVote}
            votingStartTime={votingStartTime}
            votes={votes}
            currentUser={currentUser}
            submitVote={submitVote}
            goals={goals}
            players={players}
          />
        )}

        {activeSection === 'resultados' && (
          <ResultsSection matches={matches} />
        )}

        {activeSection === 'verpredicciones' && isAdmin && (
          <AllPredictionsSection 
            matches={matches}
            predictions={predictions}
            players={players}
            calculateMatchPoints={calculateMatchPoints}
          />
        )}

        {activeSection === 'clasificacion' && (
          <ClassificationSection
            classificationTab={classificationTab}
            setClassificationTab={setClassificationTab}
            userPoints={userPoints}
            arrivals={arrivals}
            groups={groups}
            calculateGroupStandings={calculateGroupStandings}
            calculateVotingResults={calculateVotingResults}
            goals={goals}
            players={players}
            isAdmin={isAdmin}
            visibility={visibility}
          />
        )}

        {activeSection === 'admin' && isAdmin && (
          <AdminPanel
            teams={teams}
            groups={groups}
            matches={matches}
            newGroupName={newGroupName}
            setNewGroupName={setNewGroupName}
            selectedTeamsForGroup={selectedTeamsForGroup}
            toggleTeamSelection={toggleTeamSelection}
            createGroup={createGroup}
            deleteGroup={deleteGroup}
            createMatch={createMatch}
            enableMatch={enableMatch}
            deleteMatch={deleteMatch}
            registerResult={registerResult}
            editingMatch={editingMatch}
            setEditingMatch={setEditingMatch}
            getAssignedTeams={getAssignedTeams}
            showResetConfirm={showResetConfirm}
            setShowResetConfirm={setShowResetConfirm}
            resetSystem={resetSystem}
            players={players}
            arrivals={arrivals}
            selectedPlayerForArrival={selectedPlayerForArrival}
            setSelectedPlayerForArrival={setSelectedPlayerForArrival}
            arrivalTime={arrivalTime}
            setArrivalTime={setArrivalTime}
            registerArrival={registerArrival}
            goals={goals}
            newGoalDescription={newGoalDescription}
            setNewGoalDescription={setNewGoalDescription}
            addGoal={addGoal}
            updateGoal={updateGoal}
            deleteGoal={deleteGoal}
            editingGoal={editingGoal}
            setEditingGoal={setEditingGoal}
            activeVoting={activeVoting}
            enableVoting={enableVoting}
            disableVoting={disableVoting}
            calculateVotingResults={calculateVotingResults}
            visibility={visibility}
            updateVisibility={updateVisibility}
          />
        )}
      </div>
    </div>
  );
};

// Componente para ver TODAS las predicciones (Admin)
const AllPredictionsSection = ({ matches, predictions, players, calculateMatchPoints }) => {
  const [viewMode, setViewMode] = useState('all'); // 'all', 'withResult', 'noResult'
  const [selectedGroup, setSelectedGroup] = useState('all');
  
  // Filtrar partidos según el modo de vista
  let filteredMatches = matches;
  
  if (viewMode === 'withResult') {
    filteredMatches = matches.filter(m => m.result);
  } else if (viewMode === 'noResult') {
    filteredMatches = matches.filter(m => !m.result);
  }
  
  // Filtrar por grupo si se selecciona uno
  if (selectedGroup !== 'all') {
    filteredMatches = filteredMatches.filter(m => m.group === selectedGroup);
  }
  
  // Obtener grupos únicos
  const uniqueGroups = [...new Set(matches.map(m => m.group))].filter(Boolean);
  
  // Agrupar partidos por grupo
  const groupedMatches = {};
  filteredMatches.forEach(match => {
    const groupKey = match.phase === 'group' ? `Grupo ${match.group}` : 'Eliminatorias';
    if (!groupedMatches[groupKey]) {
      groupedMatches[groupKey] = [];
    }
    groupedMatches[groupKey].push(match);
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Edit className="w-8 h-8" style={{ color: '#FFD700' }} />
          Todas las Predicciones
        </h2>
      </div>
      
      {/* Filtros */}
      <div className="bg-gray-900 p-4 rounded-xl border-2" style={{ borderColor: '#FFD700' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtro por estado */}
          <div>
            <label className="block text-white mb-2 font-semibold">Estado del Partido:</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border-2 border-gray-700 focus:border-yellow-500"
            >
              <option value="all">Todos los partidos</option>
              <option value="withResult">Solo partidos finalizados</option>
              <option value="noResult">Solo partidos sin resultado</option>
            </select>
          </div>
          
          {/* Filtro por grupo */}
          <div>
            <label className="block text-white mb-2 font-semibold">Grupo/Fase:</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border-2 border-gray-700 focus:border-yellow-500"
            >
              <option value="all">Todos los grupos</option>
              {uniqueGroups.map(group => (
                <option key={group} value={group}>Grupo {group}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Resumen */}
      <div className="bg-gray-900 p-4 rounded-xl">
        <p className="text-gray-400">
          Mostrando <span className="text-white font-bold">{filteredMatches.length}</span> partido(s)
        </p>
      </div>
      
      {/* Partidos agrupados */}
      {Object.keys(groupedMatches).length === 0 ? (
        <div className="bg-gray-900 p-8 rounded-xl text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">No hay partidos con estos filtros</p>
        </div>
      ) : (
        Object.entries(groupedMatches).map(([groupName, groupMatches]) => (
          <div key={groupName} className="space-y-4">
            <h3 className="text-2xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6" style={{ color: '#FFD700' }} />
              {groupName}
            </h3>
            
            {groupMatches.map(match => (
              <MatchPredictionsCard
                key={match.id}
                match={match}
                predictions={predictions}
                players={players}
                calculateMatchPoints={calculateMatchPoints}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
};

// Componente para mostrar las predicciones de un partido
const MatchPredictionsCard = ({ match, predictions, players, calculateMatchPoints }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Obtener predicciones de este partido
  const matchPredictions = {};
  players.forEach(player => {
    if (predictions[player] && predictions[player][match.id]) {
      matchPredictions[player] = predictions[player][match.id];
    }
  });
  
  const totalPredictions = Object.keys(matchPredictions).length;
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 border-2" style={{ borderColor: match.result ? '#FFD700' : '#374151' }}>
      {/* Header del partido */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-sm mb-2" style={{ color: '#FFD700' }}>
            {match.phase === 'group' ? `Grupo ${match.group}` : 'Eliminatorias'}
            {match.result && <span className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded">FINALIZADO</span>}
            {!match.result && match.enabled && <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">ACTIVO</span>}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-white font-bold text-xl">{match.team1.team}</p>
              <p className="text-gray-400 text-sm">{match.team1.player}</p>
            </div>
            
            <div className="text-2xl font-bold mx-4" style={{ color: '#FFD700' }}>
              {match.result ? `${match.result.score1} - ${match.result.score2}` : 'VS'}
            </div>
            
            <div className="text-center">
              <p className="text-white font-bold text-xl">{match.team2.team}</p>
              <p className="text-gray-400 text-sm">{match.team2.player}</p>
            </div>
          </div>
          
          {match.result && (
            <div className="mt-2 text-sm text-gray-400">
              <p><strong style={{ color: '#FFD700' }}>Ganador:</strong> {match.result.winner}</p>
              <p><strong style={{ color: '#FFD700' }}>Primer Gol:</strong> {match.firstGoalScorer}</p>
            </div>
          )}
        </div>
        
        <div className="text-right">
          <p className="text-gray-400 text-sm">Predicciones:</p>
          <p className="text-white font-bold text-2xl">{totalPredictions}/{players.length}</p>
        </div>
      </div>
      
      {/* Botón expandir/colapsar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
      >
        {expanded ? '▲ Ocultar Predicciones' : '▼ Ver Predicciones'}
        <span className="text-xs text-gray-400">({totalPredictions} usuarios)</span>
      </button>
      
      {/* Lista de predicciones */}
      {expanded && (
        <div className="mt-4 space-y-3">
          {totalPredictions === 0 ? (
            <div className="text-center text-gray-400 py-4">
              Ningún usuario ha hecho predicción en este partido
            </div>
          ) : (
            Object.entries(matchPredictions).map(([player, prediction]) => {
              const points = match.result ? calculateMatchPoints(match, player) : null;
              
              return (
                <div key={player} className="bg-gray-800 p-4 rounded-lg border" style={{ borderColor: match.result ? '#FFD700' : '#374151' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5" style={{ color: '#FFD700' }} />
                      <p className="text-white font-bold">{player}</p>
                    </div>
                    {match.result && points && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Puntos obtenidos</p>
                        <p className="text-2xl font-bold" style={{ color: '#FFD700' }}>{points.total}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Ganador:</span>
                      <span className="text-white font-semibold">{prediction.winner}</span>
                      {match.result && (
                        <span className={`text-xl font-bold ml-2 ${prediction.winner === match.result.winner ? 'text-green-500' : 'text-red-500'}`}>
                          {prediction.winner === match.result.winner ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Resultado:</span>
                      <span className="text-white font-semibold">{prediction.score1} - {prediction.score2}</span>
                      {match.result && (
                        <span className={`text-xl font-bold ml-2 ${(prediction.score1 === match.result.score1 && prediction.score2 === match.result.score2) ? 'text-green-500' : 'text-red-500'}`}>
                          {(prediction.score1 === match.result.score1 && prediction.score2 === match.result.score2) ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Primer Gol:</span>
                      <span className="text-white font-semibold">{prediction.firstScorer}</span>
                      {match.result && (
                        <span className={`text-xl font-bold ml-2 ${prediction.firstScorer === match.firstGoalScorer ? 'text-green-500' : 'text-red-500'}`}>
                          {prediction.firstScorer === match.firstGoalScorer ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {match.result && points && (
                    <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                      <p>Ganador: {prediction.winner === match.result.winner ? '+3' : '0'} pts | 
                         Resultado: {(prediction.score1 === match.result.score1 && prediction.score2 === match.result.score2) ? '+5' : '0'} pts | 
                         Goleador: {prediction.firstScorer === match.firstGoalScorer ? '+1' : '0'} pts</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// Componente de sección de predicciones
const PredictionsSection = ({ matches, currentUser, predictions, canEditPrediction, submitPrediction, calculateMatchPoints }) => {
  // Separar partidos activos y terminados
  const activeMatches = matches.filter(m => m.enabled && !m.result);
  const finishedMatches = matches.filter(m => m.result && predictions[currentUser] && predictions[currentUser][m.id]);
  
  return (
    <div className="space-y-8">
      {/* Partidos Activos */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
          <Calendar className="w-8 h-8" style={{ color: '#FFD700' }} />
          Partidos Disponibles para Predecir
        </h2>
        
        {activeMatches.length === 0 ? (
          <div className="bg-gray-900 p-8 rounded-xl text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg">No hay partidos disponibles para predecir</p>
          </div>
        ) : (
          activeMatches.map(match => (
            <MatchPredictionCard
              key={match.id}
              match={match}
              currentUser={currentUser}
              predictions={predictions}
              canEdit={canEditPrediction(match.id)}
              onSubmit={submitPrediction}
              calculateMatchPoints={calculateMatchPoints}
            />
          ))
        )}
      </div>

      {/* Partidos Terminados */}
      {finishedMatches.length > 0 && (
        <div className="space-y-4 mt-12">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
            <Trophy className="w-8 h-8" style={{ color: '#FFD700' }} />
            Partidos Finalizados - Tus Resultados
          </h2>
          <p className="text-gray-400 mb-4">
            Aquí puedes ver cómo te fue en los partidos que ya terminaron
          </p>
          
          {finishedMatches.map(match => (
            <MatchPredictionCard
              key={match.id}
              match={match}
              currentUser={currentUser}
              predictions={predictions}
              canEdit={false}
              onSubmit={submitPrediction}
              calculateMatchPoints={calculateMatchPoints}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Componente de sección de votaciones
const VotingSection = ({ activeVoting, canVote, votingStartTime, votes, currentUser, submitVote, goals, players }) => {
  const [timeLeft, setTimeLeft] = useState(180);

  // Estados para votaciones
  const [bestGoalFirst, setBestGoalFirst] = useState('');
  const [bestGoalSecond, setBestGoalSecond] = useState('');
  const [bestGoalThird, setBestGoalThird] = useState('');
  
  const [mostQuiet, setMostQuiet] = useState('');
  const [funniest, setFunniest] = useState('');
  const [revelation, setRevelation] = useState('');
  
  const [ballonFirst, setBallonFirst] = useState('');
  const [ballonSecond, setBallonSecond] = useState('');
  const [ballonThird, setBallonThird] = useState('');

  useEffect(() => {
    if (!votingStartTime) return;
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - votingStartTime) / 1000;
      const remaining = Math.max(0, 180 - elapsed);
      setTimeLeft(Math.floor(remaining));
      
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [votingStartTime]);

  // Cargar voto existente
  useEffect(() => {
    if (votes[currentUser]?.[activeVoting]) {
      const vote = votes[currentUser][activeVoting];
      
      if (activeVoting === 'best_goal') {
        setBestGoalFirst(vote.first || '');
        setBestGoalSecond(vote.second || '');
        setBestGoalThird(vote.third || '');
      } else if (activeVoting === 'most_quiet') {
        setMostQuiet(vote);
      } else if (activeVoting === 'funniest') {
        setFunniest(vote);
      } else if (activeVoting === 'revelation') {
        setRevelation(vote);
      } else if (activeVoting === 'ballon_dor') {
        setBallonFirst(vote.first || '');
        setBallonSecond(vote.second || '');
        setBallonThird(vote.third || '');
      }
    }
  }, [votes, currentUser, activeVoting]);

  const handleSubmit = () => {
    if (activeVoting === 'best_goal') {
      if (!bestGoalFirst || !bestGoalSecond || !bestGoalThird) {
        alert('Debes seleccionar los 3 goles');
        return;
      }
      submitVote('best_goal', { first: bestGoalFirst, second: bestGoalSecond, third: bestGoalThird });
    } else if (activeVoting === 'most_quiet') {
      if (!mostQuiet) {
        alert('Debes seleccionar un jugador');
        return;
      }
      submitVote('most_quiet', mostQuiet);
    } else if (activeVoting === 'funniest') {
      if (!funniest) {
        alert('Debes seleccionar un jugador');
        return;
      }
      submitVote('funniest', funniest);
    } else if (activeVoting === 'revelation') {
      if (!revelation) {
        alert('Debes seleccionar un jugador');
        return;
      }
      submitVote('revelation', revelation);
    } else if (activeVoting === 'ballon_dor') {
      if (!ballonFirst || !ballonSecond || !ballonThird) {
        alert('Debes seleccionar los 3 jugadores');
        return;
      }
      submitVote('ballon_dor', { first: ballonFirst, second: ballonSecond, third: ballonThird });
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!activeVoting) {
    return (
      <div className="bg-gray-900 p-8 rounded-xl text-center">
        <Vote className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <p className="text-gray-400 text-lg">No hay votaciones activas en este momento</p>
      </div>
    );
  }

  const votingNames = {
    'best_goal': 'Mejor Gol',
    'most_quiet': 'Más Callado',
    'funniest': 'Más Chistoso',
    'revelation': 'Jugador Revelación',
    'ballon_dor': 'Balón de Oro'
  };

  const votingIcons = {
    'best_goal': Star,
    'most_quiet': UserCheck,
    'funniest': Smile,
    'revelation': Zap,
    'ballon_dor': Trophy
  };

  const Icon = votingIcons[activeVoting];

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-xl p-6 border-2" style={{ borderColor: '#FFD700' }}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Icon className="w-8 h-8" style={{ color: '#FFD700' }} />
            <h2 className="text-3xl font-bold text-white">{votingNames[activeVoting]}</h2>
          </div>
          {canVote() && (
            <div className="flex items-center gap-2" style={{ color: '#FFD700' }}>
              <Clock className="w-5 h-5" />
              <span className="font-bold text-lg">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {canVote() ? (
          <div className="space-y-4">
            {activeVoting === 'best_goal' && (
              <>
                <div>
                  <label className="block text-white mb-2 font-semibold">1º Lugar (5 puntos)</label>
                  <select
                    value={bestGoalFirst}
                    onChange={(e) => setBestGoalFirst(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border-2 focus:outline-none"
                    style={{ borderColor: '#FFD700' }}
                  >
                    <option value="">-- Seleccionar --</option>
                    {goals.map(goal => (
                      <option 
                        key={goal.id} 
                        value={goal.id}
                        disabled={goal.id === bestGoalSecond || goal.id === bestGoalThird}
                      >
                        {goal.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold">2º Lugar (3 puntos)</label>
                  <select
                    value={bestGoalSecond}
                    onChange={(e) => setBestGoalSecond(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border-2 focus:outline-none"
                    style={{ borderColor: '#FFD700' }}
                  >
                    <option value="">-- Seleccionar --</option>
                    {goals.map(goal => (
                      <option 
                        key={goal.id} 
                        value={goal.id}
                        disabled={goal.id === bestGoalFirst || goal.id === bestGoalThird}
                      >
                        {goal.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold">3º Lugar (1 punto)</label>
                  <select
                    value={bestGoalThird}
                    onChange={(e) => setBestGoalThird(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border-2 focus:outline-none"
                    style={{ borderColor: '#FFD700' }}
                  >
                    <option value="">-- Seleccionar --</option>
                    {goals.map(goal => (
                      <option 
                        key={goal.id} 
                        value={goal.id}
                        disabled={goal.id === bestGoalFirst || goal.id === bestGoalSecond}
                      >
                        {goal.description}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {activeVoting === 'most_quiet' && (
              <div>
                <label className="block text-white mb-2 font-semibold">Selecciona al jugador más callado</label>
                <select
                  value={mostQuiet}
                  onChange={(e) => setMostQuiet(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border-2 focus:outline-none"
                  style={{ borderColor: '#FFD700' }}
                >
                  <option value="">-- Seleccionar --</option>
                  {players.map((player, idx) => (
                    <option key={idx} value={player}>{player}</option>
                  ))}
                </select>
              </div>
            )}

            {activeVoting === 'funniest' && (
              <div>
                <label className="block text-white mb-2 font-semibold">Selecciona al jugador más chistoso</label>
                <select
                  value={funniest}
                  onChange={(e) => setFunniest(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border-2 focus:outline-none"
                  style={{ borderColor: '#FFD700' }}
                >
                  <option value="">-- Seleccionar --</option>
                  {players.map((player, idx) => (
                    <option key={idx} value={player}>{player}</option>
                  ))}
                </select>
              </div>
            )}

            {activeVoting === 'revelation' && (
              <div>
                <label className="block text-white mb-2 font-semibold">Selecciona al jugador revelación</label>
                <select
                  value={revelation}
                  onChange={(e) => setRevelation(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border-2 focus:outline-none"
                  style={{ borderColor: '#FFD700' }}
                >
                  <option value="">-- Seleccionar --</option>
                  {players.map((player, idx) => (
                    <option key={idx} value={player}>{player}</option>
                  ))}
                </select>
              </div>
            )}

            {activeVoting === 'ballon_dor' && (
              <>
                <div>
                  <label className="block text-white mb-2 font-semibold">1º Lugar (5 puntos)</label>
                  <select
                    value={ballonFirst}
                    onChange={(e) => setBallonFirst(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border-2 focus:outline-none"
                    style={{ borderColor: '#FFD700' }}
                  >
                    <option value="">-- Seleccionar --</option>
                    {players.map((player, idx) => (
                      <option 
                        key={idx} 
                        value={player}
                        disabled={player === ballonSecond || player === ballonThird}
                      >
                        {player}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold">2º Lugar (3 puntos)</label>
                  <select
                    value={ballonSecond}
                    onChange={(e) => setBallonSecond(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border-2 focus:outline-none"
                    style={{ borderColor: '#FFD700' }}
                  >
                    <option value="">-- Seleccionar --</option>
                    {players.map((player, idx) => (
                      <option 
                        key={idx} 
                        value={player}
                        disabled={player === ballonFirst || player === ballonThird}
                      >
                        {player}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold">3º Lugar (1 punto)</label>
                  <select
                    value={ballonThird}
                    onChange={(e) => setBallonThird(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border-2 focus:outline-none"
                    style={{ borderColor: '#FFD700' }}
                  >
                    <option value="">-- Seleccionar --</option>
                    {players.map((player, idx) => (
                      <option 
                        key={idx} 
                        value={player}
                        disabled={player === ballonFirst || player === ballonSecond}
                      >
                        {player}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-lg font-bold text-lg transition-all hover:scale-105"
              style={{ background: '#FFD700', color: '#05080F' }}
            >
              {votes[currentUser]?.[activeVoting] ? 'ACTUALIZAR VOTO' : 'ENVIAR VOTO'}
            </button>
          </div>
        ) : votes[currentUser]?.[activeVoting] ? (
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 mb-2">Tu voto ya fue registrado</p>
            <p className="text-white">✅ Voto guardado exitosamente</p>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-4">
            El tiempo para votar ha expirado
          </div>
        )}
      </div>
    </div>
  );
};

// Sección de resultados (no cambió mucho, solo muestra los partidos)
const ResultsSection = ({ matches }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6">Resultados de Partidos</h2>
      
      {matches.filter(m => m.result).length === 0 ? (
        <div className="bg-gray-900 p-8 rounded-xl text-center">
          <Award className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">No hay resultados disponibles aún</p>
        </div>
      ) : (
        matches.filter(m => m.result).map(match => (
          <ResultCard key={match.id} match={match} />
        ))
      )}
    </div>
  );
};

// Componente de tarjeta de predicción (sin cambios significativos)
const MatchPredictionCard = ({ match, currentUser, predictions, canEdit, onSubmit, calculateMatchPoints }) => {
  const [winner, setWinner] = useState('');
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [firstScorer, setFirstScorer] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);
  const [isEditing, setIsEditing] = useState(false);
  
  // Guardar valores originales para poder cancelar
  const [originalValues, setOriginalValues] = useState({
    winner: '',
    score1: '',
    score2: '',
    firstScorer: ''
  });

  const userPrediction = predictions[currentUser]?.[match.id];

  useEffect(() => {
    if (userPrediction) {
      const values = {
        winner: userPrediction.winner,
        score1: userPrediction.score1,
        score2: userPrediction.score2,
        firstScorer: userPrediction.firstScorer
      };
      setWinner(values.winner);
      setScore1(values.score1);
      setScore2(values.score2);
      setFirstScorer(values.firstScorer);
      setOriginalValues(values);
    } else {
      // Si no hay predicción, activar modo edición automáticamente
      setIsEditing(true);
    }
  }, [userPrediction]);

  useEffect(() => {
    if (!match.enabledAt) return;
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - match.enabledAt) / 1000;
      const remaining = Math.max(0, 180 - elapsed);
      setTimeLeft(Math.floor(remaining));
      
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [match.enabledAt]);

  const handleSubmit = () => {
    if (!winner || !score1 || !score2 || !firstScorer) {
      alert('Debes completar todos los campos');
      return;
    }
    onSubmit(match.id, winner, score1, score2, firstScorer);
    setIsEditing(false); // Salir del modo edición después de guardar
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    // Restaurar valores originales
    setWinner(originalValues.winner);
    setScore1(originalValues.score1);
    setScore2(originalValues.score2);
    setFirstScorer(originalValues.firstScorer);
    setIsEditing(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-gray-900 rounded-xl p-6 border-2" style={{ borderColor: '#FFD700' }}>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm" style={{ color: '#FFD700' }}>
          {match.phase === 'group' ? `Grupo ${match.group}` : 'Eliminatorias'}
        </div>
        {canEdit && (
          <div className="flex items-center gap-2" style={{ color: '#FFD700' }}>
            <Clock className="w-5 h-5" />
            <span className="font-bold text-lg">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="text-center flex-1">
          <p className="text-white font-bold text-xl">{match.team1.team}</p>
          <p className="text-gray-400 text-sm">{match.team1.player}</p>
        </div>
        
        <div className="text-3xl font-bold mx-8" style={{ color: '#FFD700' }}>VS</div>
        
        <div className="text-center flex-1">
          <p className="text-white font-bold text-xl">{match.team2.team}</p>
          <p className="text-gray-400 text-sm">{match.team2.player}</p>
        </div>
      </div>

      {/* CASO 1: Partido finalizado (no se puede editar) - Muestra resultados con checkmarks */}
      {!canEdit && userPrediction ? (
        <div className="bg-gray-800 p-4 rounded-lg border-2" style={{ borderColor: match.result ? '#FFD700' : '#374151' }}>
          <p className="text-gray-400 mb-3 font-semibold">Tu predicción:</p>
          
          {match.result ? (
            // Mostrar predicción con resultados
            <>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <p className="text-white">
                    <strong style={{ color: '#FFD700' }}>Ganador:</strong> {userPrediction.winner}
                  </p>
                  <span className={`text-2xl font-bold ${
                    userPrediction.winner === match.result.winner ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {userPrediction.winner === match.result.winner ? '✓' : '✗'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-white">
                    <strong style={{ color: '#FFD700' }}>Resultado:</strong> {userPrediction.score1} - {userPrediction.score2}
                  </p>
                  <span className={`text-2xl font-bold ${
                    (userPrediction.score1 === match.result.score1 && userPrediction.score2 === match.result.score2) 
                      ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(userPrediction.score1 === match.result.score1 && userPrediction.score2 === match.result.score2) 
                      ? '✓' : '✗'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-white">
                    <strong style={{ color: '#FFD700' }}>Primer Gol:</strong> {userPrediction.firstScorer}
                  </p>
                  <span className={`text-2xl font-bold ${
                    userPrediction.firstScorer === match.firstGoalScorer ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {userPrediction.firstScorer === match.firstGoalScorer ? '✓' : '✗'}
                  </span>
                </div>
              </div>
              
              {/* Puntos ganados en este partido */}
              <div className="mt-4 pt-4 border-t-2" style={{ borderColor: '#FFD700' }}>
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">Puntos obtenidos:</span>
                  <span className="text-3xl font-bold" style={{ color: '#FFD700' }}>
                    {calculateMatchPoints(match, currentUser).total}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  <p>Ganador: {userPrediction.winner === match.result.winner ? '+3' : '0'} pts</p>
                  <p>Resultado exacto: {(userPrediction.score1 === match.result.score1 && userPrediction.score2 === match.result.score2) ? '+5' : '0'} pts</p>
                  <p>Primer goleador: {userPrediction.firstScorer === match.firstGoalScorer ? '+1' : '0'} pts</p>
                </div>
              </div>
            </>
          ) : (
            // Partido sin resultado aún
            <>
              <p className="text-white">
                <strong style={{ color: '#FFD700' }}>Ganador:</strong> {userPrediction.winner}
              </p>
              <p className="text-white">
                <strong style={{ color: '#FFD700' }}>Resultado:</strong> {userPrediction.score1} - {userPrediction.score2}
              </p>
              <p className="text-white">
                <strong style={{ color: '#FFD700' }}>Primer Gol:</strong> {userPrediction.firstScorer}
              </p>
              <p className="text-xs text-gray-400 mt-2 italic">Esperando resultado del partido...</p>
            </>
          )}
        </div>
      
      /* CASO 2: Tiene predicción guardada pero puede editar y NO está editando - Solo lectura con botón Editar */
      ) : canEdit && userPrediction && !isEditing ? (
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg border-2" style={{ borderColor: '#FFD700' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 font-semibold">Tu predicción guardada:</p>
              <button
                onClick={handleEdit}
                className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all hover:scale-105"
                style={{ 
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#05080F'
                }}
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
            </div>
            
            <div className="space-y-2">
              <p className="text-white">
                <strong style={{ color: '#FFD700' }}>Ganador:</strong> {winner}
              </p>
              <p className="text-white">
                <strong style={{ color: '#FFD700' }}>Resultado:</strong> {score1} - {score2}
              </p>
              <p className="text-white">
                <strong style={{ color: '#FFD700' }}>Primer Gol:</strong> {firstScorer}
              </p>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Tiempo restante: {minutes}:{seconds.toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>
      
      /* CASO 3: Modo edición activo O no tiene predicción aún - Formulario */
      ) : canEdit && isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2 font-semibold">¿Quién gana?</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setWinner(match.team1.team)}
                className={`py-3 rounded-lg font-bold transition-all ${winner === match.team1.team ? 'scale-105' : ''}`}
                style={{
                  background: winner === match.team1.team ? '#FFD700' : '#1F2937',
                  color: winner === match.team1.team ? '#05080F' : 'white',
                  border: '2px solid #FFD700'
                }}
              >
                {match.team1.team}
              </button>
              <button
                onClick={() => setWinner('Empate')}
                className={`py-3 rounded-lg font-bold transition-all ${winner === 'Empate' ? 'scale-105' : ''}`}
                style={{
                  background: winner === 'Empate' ? '#FFD700' : '#1F2937',
                  color: winner === 'Empate' ? '#05080F' : 'white',
                  border: '2px solid #FFD700'
                }}
              >
                EMPATE
              </button>
              <button
                onClick={() => setWinner(match.team2.team)}
                className={`py-3 rounded-lg font-bold transition-all ${winner === match.team2.team ? 'scale-105' : ''}`}
                style={{
                  background: winner === match.team2.team ? '#FFD700' : '#1F2937',
                  color: winner === match.team2.team ? '#05080F' : 'white',
                  border: '2px solid #FFD700'
                }}
              >
                {match.team2.team}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white mb-2 font-semibold">Resultado Final</label>
            <div className="flex items-center justify-center gap-4">
              <input
                type="number"
                min="0"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
                placeholder="0"
                className="w-20 p-3 text-center text-2xl font-bold rounded-lg bg-gray-800 text-white border-2 focus:outline-none"
                style={{ borderColor: '#FFD700' }}
              />
              <span className="text-2xl font-bold" style={{ color: '#FFD700' }}>-</span>
              <input
                type="number"
                min="0"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                placeholder="0"
                className="w-20 p-3 text-center text-2xl font-bold rounded-lg bg-gray-800 text-white border-2 focus:outline-none"
                style={{ borderColor: '#FFD700' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-white mb-2 font-semibold">Primer Goleador</label>
            <select
              value={firstScorer}
              onChange={(e) => setFirstScorer(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 text-white border-2 focus:outline-none"
              style={{ borderColor: '#FFD700' }}
            >
              <option value="">-- Seleccionar --</option>
              <option value="Sin goles">Sin goles</option>
              <option value={match.team1.player}>{match.team1.player} ({match.team1.team})</option>
              <option value={match.team2.player}>{match.team2.player} ({match.team2.team})</option>
            </select>
          </div>

          {/* Botones de acción */}
          {userPrediction ? (
            // Si ya tiene predicción: Guardar y Cancelar
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-lg font-bold text-lg transition-all hover:scale-105"
                style={{ 
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#05080F'
                }}
              >
                <Save className="w-5 h-5 inline mr-2" />
                GUARDAR CAMBIOS
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-lg font-bold text-lg bg-gray-700 text-white hover:bg-gray-600 transition-all"
              >
                Cancelar
              </button>
            </div>
          ) : (
            // Si es primera predicción: Solo Guardar
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-lg font-bold text-lg transition-all hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#05080F'
              }}
            >
              GUARDAR PREDICCIÓN
            </button>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-4">
          El tiempo para predecir ha expirado
        </div>
      )}
    </div>
  );
};

// Componente de resultado
const ResultCard = ({ match }) => {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border-2" style={{ borderColor: '#FFD700' }}>
      <div className="text-sm mb-4" style={{ color: '#FFD700' }}>
        {match.phase === 'group' ? `Grupo ${match.group}` : 'Eliminatorias'} - FINALIZADO
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-center flex-1">
          <p className="text-white font-bold text-xl">{match.team1.team}</p>
          <p className="text-gray-400 text-sm">{match.team1.player}</p>
        </div>
        
        <div className="text-center mx-8">
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-white">{match.result.score1}</span>
            <span className="text-2xl" style={{ color: '#FFD700' }}>-</span>
            <span className="text-4xl font-bold text-white">{match.result.score2}</span>
          </div>
        </div>
        
        <div className="text-center flex-1">
          <p className="text-white font-bold text-xl">{match.team2.team}</p>
          <p className="text-gray-400 text-sm">{match.team2.player}</p>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <p className="text-white">
          <strong style={{ color: '#FFD700' }}>Ganador:</strong> {match.result.winner}
        </p>
        <p className="text-white">
          <strong style={{ color: '#FFD700' }}>Primer Gol:</strong> {match.firstGoalScorer}
        </p>
      </div>
    </div>
  );
};

// Sección de clasificación con pestañas
const ClassificationSection = ({ classificationTab, setClassificationTab, userPoints, arrivals, groups, calculateGroupStandings, calculateVotingResults, goals, players, isAdmin, visibility }) => {
  
  // Determinar qué tabs mostrar
  const showPredictionsTab = isAdmin || visibility?.predictions;
  const showImpuntualTab = isAdmin || visibility?.standings;
  const showGruposTab = true; // Siempre visible
  const showVotingTabs = isAdmin || visibility?.voting;
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6">Clasificaciones</h2>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-gray-900 p-2 rounded-xl border-2" style={{ borderColor: '#FFD700' }}>
        {showPredictionsTab && (
          <button
            onClick={() => setClassificationTab('predicciones')}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all text-sm ${classificationTab === 'predicciones' ? '' : 'text-gray-400'}`}
            style={classificationTab === 'predicciones' ? { background: '#FFD700', color: '#05080F' } : {}}
          >
            Predicciones
          </button>
        )}
        
        {showImpuntualTab && (
          <button
            onClick={() => setClassificationTab('impuntual')}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all text-sm ${classificationTab === 'impuntual' ? '' : 'text-gray-400'}`}
            style={classificationTab === 'impuntual' ? { background: '#FFD700', color: '#05080F' } : {}}
          >
            <Timer className="inline w-4 h-4 mr-1" />
            Impuntual
          </button>
        )}
        
        {/* Grupos - SIEMPRE visible */}
        <button
          onClick={() => setClassificationTab('grupos')}
          className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all text-sm ${classificationTab === 'grupos' ? '' : 'text-gray-400'}`}
          style={classificationTab === 'grupos' ? { background: '#FFD700', color: '#05080F' } : {}}
        >
          Grupos
        </button>
        
        {showVotingTabs && (
          <>
            <button
              onClick={() => setClassificationTab('mejor_gol')}
              className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all text-sm ${classificationTab === 'mejor_gol' ? '' : 'text-gray-400'}`}
              style={classificationTab === 'mejor_gol' ? { background: '#FFD700', color: '#05080F' } : {}}
            >
              <Star className="inline w-4 h-4 mr-1" />
              Mejor Gol
            </button>
            <button
              onClick={() => setClassificationTab('mas_callado')}
              className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all text-sm ${classificationTab === 'mas_callado' ? '' : 'text-gray-400'}`}
              style={classificationTab === 'mas_callado' ? { background: '#FFD700', color: '#05080F' } : {}}
            >
              Callado
            </button>
            <button
              onClick={() => setClassificationTab('mas_chistoso')}
              className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all text-sm ${classificationTab === 'mas_chistoso' ? '' : 'text-gray-400'}`}
              style={classificationTab === 'mas_chistoso' ? { background: '#FFD700', color: '#05080F' } : {}}
            >
              <Smile className="inline w-4 h-4 mr-1" />
              Chistoso
            </button>
            <button
              onClick={() => setClassificationTab('revelacion')}
              className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all text-sm ${classificationTab === 'revelacion' ? '' : 'text-gray-400'}`}
              style={classificationTab === 'revelacion' ? { background: '#FFD700', color: '#05080F' } : {}}
            >
              <Zap className="inline w-4 h-4 mr-1" />
              Revelación
            </button>
            <button
              onClick={() => setClassificationTab('ballon_dor')}
              className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all text-sm ${classificationTab === 'ballon_dor' ? '' : 'text-gray-400'}`}
              style={classificationTab === 'ballon_dor' ? { background: '#FFD700', color: '#05080F' } : {}}
            >
              <Trophy className="inline w-4 h-4 mr-1" />
              Balón d'Or
            </button>
          </>
        )}
      </div>

      {/* Contenido de las pestañas */}
      {classificationTab === 'predicciones' && showPredictionsTab && (
        <div className="bg-gray-900 rounded-xl overflow-hidden border-2" style={{ borderColor: '#FFD700' }}>
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left" style={{ color: '#FFD700' }}>Posición</th>
                <th className="px-6 py-4 text-left" style={{ color: '#FFD700' }}>Jugador</th>
                <th className="px-6 py-4 text-center" style={{ color: '#FFD700' }}>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(userPoints)
                .sort(([,a], [,b]) => b - a)
                .map(([player, points], idx) => (
                  <tr key={player} className="border-t border-gray-800">
                    <td className="px-6 py-4">
                      <span className="text-2xl font-bold" style={{ color: '#FFD700' }}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">{player}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-2xl font-bold" style={{ color: '#FFD700' }}>
                        {points}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {classificationTab === 'impuntual' && showImpuntualTab && (
        <div className="bg-gray-900 rounded-xl overflow-hidden border-2" style={{ borderColor: '#FFD700' }}>
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left" style={{ color: '#FFD700' }}>Posición</th>
                <th className="px-6 py-4 text-left" style={{ color: '#FFD700' }}>Jugador</th>
                <th className="px-6 py-4 text-center" style={{ color: '#FFD700' }}>Hora de Llegada</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(arrivals)
                .sort(([,a], [,b]) => b.localeCompare(a))
                .map(([player, time], idx) => (
                  <tr key={player} className="border-t border-gray-800">
                    <td className="px-6 py-4">
                      <span className="text-2xl font-bold" style={{ color: idx === 0 ? '#ef4444' : '#FFD700' }}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${idx === 0 ? 'text-red-400' : 'text-white'}`}>
                        {player}
                        {idx === 0 && ' 🐌'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-2xl font-bold ${idx === 0 ? 'text-red-400' : ''}`} style={{ color: idx === 0 ? '' : '#FFD700' }}>
                        {time}
                      </span>
                    </td>
                  </tr>
                ))}
              {Object.keys(arrivals).length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-400">
                    No hay registros de llegada aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {classificationTab === 'grupos' && (
        <div className="space-y-6">
          {Object.keys(groups).length === 0 ? (
            <div className="bg-gray-900 p-8 rounded-xl text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg">No hay grupos creados aún</p>
            </div>
          ) : (
            Object.keys(groups).map(groupName => {
              const standings = calculateGroupStandings(groupName);
              return (
                <div key={groupName} className="bg-gray-900 rounded-xl overflow-hidden border-2" style={{ borderColor: '#FFD700' }}>
                  <div className="bg-gray-800 px-6 py-3">
                    <h3 className="text-xl font-bold" style={{ color: '#FFD700' }}>Grupo {groupName}</h3>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-800 border-t-2 border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm" style={{ color: '#FFD700' }}>Pos</th>
                        <th className="px-4 py-3 text-left text-sm" style={{ color: '#FFD700' }}>Equipo</th>
                        <th className="px-4 py-3 text-center text-sm" style={{ color: '#FFD700' }}>PJ</th>
                        <th className="px-4 py-3 text-center text-sm" style={{ color: '#FFD700' }}>G</th>
                        <th className="px-4 py-3 text-center text-sm" style={{ color: '#FFD700' }}>E</th>
                        <th className="px-4 py-3 text-center text-sm" style={{ color: '#FFD700' }}>P</th>
                        <th className="px-4 py-3 text-center text-sm" style={{ color: '#FFD700' }}>GF</th>
                        <th className="px-4 py-3 text-center text-sm" style={{ color: '#FFD700' }}>GC</th>
                        <th className="px-4 py-3 text-center text-sm" style={{ color: '#FFD700' }}>DG</th>
                        <th className="px-4 py-3 text-center text-sm" style={{ color: '#FFD700' }}>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((team, idx) => (
                        <tr key={team.team} className="border-t border-gray-800">
                          <td className="px-4 py-3">
                            <span className="text-lg font-bold" style={{ color: '#FFD700' }}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-white font-semibold">{team.team}</p>
                              <p className="text-xs text-gray-400">{team.player}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-white">{team.played}</td>
                          <td className="px-4 py-3 text-center text-white">{team.won}</td>
                          <td className="px-4 py-3 text-center text-white">{team.drawn}</td>
                          <td className="px-4 py-3 text-center text-white">{team.lost}</td>
                          <td className="px-4 py-3 text-center text-white">{team.goalsFor}</td>
                          <td className="px-4 py-3 text-center text-white">{team.goalsAgainst}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={team.goalDifference >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xl font-bold" style={{ color: '#FFD700' }}>
                              {team.points}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tablas de votaciones */}
      {classificationTab === 'mejor_gol' && showVotingTabs && (
        <VotingResultsTable 
          title="Mejor Gol"
          results={calculateVotingResults('best_goal')}
          goals={goals}
          isGoalVoting={true}
        />
      )}

      {classificationTab === 'mas_callado' && showVotingTabs && (
        <VotingResultsTable 
          title="Más Callado"
          results={calculateVotingResults('most_quiet')}
        />
      )}

      {classificationTab === 'mas_chistoso' && showVotingTabs && (
        <VotingResultsTable 
          title="Más Chistoso"
          results={calculateVotingResults('funniest')}
        />
      )}

      {classificationTab === 'revelacion' && showVotingTabs && (
        <VotingResultsTable 
          title="Jugador Revelación"
          results={calculateVotingResults('revelation')}
        />
      )}

      {classificationTab === 'ballon_dor' && showVotingTabs && (
        <VotingResultsTable 
          title="Balón d'Or"
          results={calculateVotingResults('ballon_dor')}
        />
      )}
    </div>
  );
};

// Tabla de resultados de votaciones
const VotingResultsTable = ({ title, results, goals, isGoalVoting }) => {
  const getGoalDescription = (goalId) => {
    const goal = goals?.find(g => g.id === parseInt(goalId));
    return goal ? goal.description : goalId;
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border-2" style={{ borderColor: '#FFD700' }}>
      <div className="bg-gray-800 px-6 py-3">
        <h3 className="text-xl font-bold" style={{ color: '#FFD700' }}>{title}</h3>
      </div>
      <table className="w-full">
        <thead className="bg-gray-800 border-t-2 border-gray-700">
          <tr>
            <th className="px-6 py-4 text-left" style={{ color: '#FFD700' }}>Posición</th>
            <th className="px-6 py-4 text-left" style={{ color: '#FFD700' }}>{isGoalVoting ? 'Gol' : 'Jugador'}</th>
            <th className="px-6 py-4 text-center" style={{ color: '#FFD700' }}>Puntos/Votos</th>
          </tr>
        </thead>
        <tbody>
          {results.length === 0 ? (
            <tr>
              <td colSpan="3" className="px-6 py-8 text-center text-gray-400">
                No hay votos registrados aún
              </td>
            </tr>
          ) : (
            results.map(([item, points], idx) => (
              <tr key={item} className="border-t border-gray-800">
                <td className="px-6 py-4">
                  <span className="text-2xl font-bold" style={{ color: '#FFD700' }}>
                    {idx + 1}
                  </span>
                </td>
                <td className="px-6 py-4 text-white font-semibold">
                  {isGoalVoting ? getGoalDescription(item) : item}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-2xl font-bold" style={{ color: '#FFD700' }}>
                    {points}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const AdminPanel = (props) => {
  const {
    teams, groups, matches, newGroupName, setNewGroupName, selectedTeamsForGroup,
    toggleTeamSelection, createGroup, deleteGroup, createMatch, enableMatch, deleteMatch,
    registerResult, editingMatch, setEditingMatch, getAssignedTeams, showResetConfirm,
    setShowResetConfirm, resetSystem, players, arrivals, selectedPlayerForArrival,
    setSelectedPlayerForArrival, arrivalTime, setArrivalTime, registerArrival, goals,
    newGoalDescription, setNewGoalDescription, addGoal, updateGoal, deleteGoal, editingGoal,
    setEditingGoal, activeVoting, enableVoting, disableVoting, calculateVotingResults,
    visibility, updateVisibility
  } = props;

  const [showMatchCreator, setShowMatchCreator] = useState(false);
  const [matchGroup, setMatchGroup] = useState('');
  const [matchTeam1, setMatchTeam1] = useState('');
  const [matchTeam2, setMatchTeam2] = useState('');
  const [matchPhase, setMatchPhase] = useState('group');
  const [resultWinner, setResultWinner] = useState('');
  const [resultScore1, setResultScore1] = useState('');
  const [resultScore2, setResultScore2] = useState('');
  const [resultFirstScorer, setResultFirstScorer] = useState('');
  const [editGoalDescription, setEditGoalDescription] = useState('');

  const assignedTeams = getAssignedTeams();

  const handleCreateMatch = () => {
    if (!matchGroup || !matchTeam1 || !matchTeam2) {
      alert('Completa todos los campos');
      return;
    }
    if (matchTeam1 === matchTeam2) {
      alert('Los equipos deben ser diferentes');
      return;
    }
    createMatch(matchGroup, matchTeam1, matchTeam2, matchPhase);
    setMatchGroup('');
    setMatchTeam1('');
    setMatchTeam2('');
    setShowMatchCreator(false);
    alert('Partido creado exitosamente');
  };

  const handleRegisterResult = (matchId) => {
    if (!resultWinner || resultScore1 === '' || resultScore2 === '' || !resultFirstScorer) {
      alert('Completa todos los campos');
      return;
    }
    registerResult(matchId, resultWinner, resultScore1, resultScore2, resultFirstScorer);
    setEditingMatch(null);
    setResultWinner('');
    setResultScore1('');
    setResultScore2('');
    setResultFirstScorer('');
    alert('Resultado registrado exitosamente');
  };

  const handleEditMatch = (match) => {
    setEditingMatch(match.id);
    if (match.result) {
      setResultWinner(match.result.winner);
      setResultScore1(match.result.score1);
      setResultScore2(match.result.score2);
      setResultFirstScorer(match.firstGoalScorer);
    }
  };

  return (
    <div className="space-y-8">
      {/* Control de Visibilidad */}
      <div className="bg-gray-900 rounded-xl p-6 border-2" style={{ borderColor: '#FFD700' }}>
        <div className="flex items-center gap-3 mb-6">
          <Eye className="w-8 h-8" style={{ color: '#FFD700' }} />
          <h3 className="text-2xl font-bold text-white">Control de Visibilidad</h3>
        </div>
        
        <p className="text-gray-400 mb-4">
          Controla qué secciones pueden ver los usuarios normales.
        </p>
        
        <div className="bg-gray-800 p-4 rounded-lg mb-6 border-2 border-blue-500">
          <p className="text-blue-300 font-semibold mb-2">📌 Reglas de Visibilidad:</p>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• <strong>Votaciones:</strong> Tab siempre visible, items dentro se muestran cuando se habilita "Votaciones"</li>
            <li>• <strong>Clasificación:</strong> Tab siempre visible. Usuarios ven "Grupos" siempre. Otras tablas según configuración</li>
            <li>• <strong>Admin:</strong> Ve todas las tablas de clasificación sin restricciones</li>
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Grupos - Siempre visible */}
          <div className="bg-gray-800 p-4 rounded-lg border-2" style={{ borderColor: '#4ade80' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" style={{ color: '#4ade80' }} />
                <span className="text-white font-semibold">Grupos</span>
              </div>
              <span className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
                Siempre visible
              </span>
            </div>
          </div>
          
          {/* Predicciones */}
          <div className="bg-gray-800 p-4 rounded-lg border-2" style={{ borderColor: visibility?.predictions ? '#4ade80' : '#6b7280' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" style={{ color: visibility?.predictions ? '#4ade80' : '#6b7280' }} />
                <span className="text-white font-semibold">Predicciones</span>
              </div>
              <button
                onClick={() => updateVisibility('predictions', !visibility?.predictions)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  visibility?.predictions ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {visibility?.predictions ? (
                  <><EyeOff className="w-4 h-4 inline mr-2" />Ocultar</>
                ) : (
                  <><Eye className="w-4 h-4 inline mr-2" />Mostrar</>
                )}
              </button>
            </div>
          </div>
          
          {/* Resultados */}
          <div className="bg-gray-800 p-4 rounded-lg border-2" style={{ borderColor: visibility?.results ? '#4ade80' : '#6b7280' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5" style={{ color: visibility?.results ? '#4ade80' : '#6b7280' }} />
                <span className="text-white font-semibold">Resultados</span>
              </div>
              <button
                onClick={() => updateVisibility('results', !visibility?.results)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  visibility?.results ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {visibility?.results ? (
                  <><EyeOff className="w-4 h-4 inline mr-2" />Ocultar</>
                ) : (
                  <><Eye className="w-4 h-4 inline mr-2" />Mostrar</>
                )}
              </button>
            </div>
          </div>
          
          {/* Clasificación - Tablas internas */}
          <div className="bg-gray-800 p-4 rounded-lg border-2" style={{ borderColor: visibility?.standings ? '#4ade80' : '#6b7280' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5" style={{ color: visibility?.standings ? '#4ade80' : '#6b7280' }} />
                <div>
                  <span className="text-white font-semibold block">Tablas de Clasificación</span>
                  <span className="text-xs text-gray-400">Predicciones e Impuntual</span>
                </div>
              </div>
              <button
                onClick={() => updateVisibility('standings', !visibility?.standings)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  visibility?.standings ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {visibility?.standings ? (
                  <><EyeOff className="w-4 h-4 inline mr-2" />Ocultar</>
                ) : (
                  <><Eye className="w-4 h-4 inline mr-2" />Mostrar</>
                )}
              </button>
            </div>
          </div>
          
          {/* Votaciones */}
          <div className="bg-gray-800 p-4 rounded-lg border-2" style={{ borderColor: visibility?.voting ? '#4ade80' : '#6b7280' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Vote className="w-5 h-5" style={{ color: visibility?.voting ? '#4ade80' : '#6b7280' }} />
                <div>
                  <span className="text-white font-semibold block">Votaciones</span>
                  <span className="text-xs text-gray-400">Items y tablas de votación</span>
                </div>
              </div>
              <button
                onClick={() => updateVisibility('voting', !visibility?.voting)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  visibility?.voting ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {visibility?.voting ? (
                  <><EyeOff className="w-4 h-4 inline mr-2" />Ocultar</>
                ) : (
                  <><Eye className="w-4 h-4 inline mr-2" />Mostrar</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Control de Llegadas */}
      <div className="bg-gray-900 rounded-xl p-6 border-2" style={{ borderColor: '#FFD700' }}>
        <div className="flex items-center gap-3 mb-6">
          <Timer className="w-8 h-8" style={{ color: '#FFD700' }} />
          <h3 className="text-2xl font-bold text-white">Control de Llegadas</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-white mb-2 font-semibold">Seleccionar Jugador</label>
            <select
              value={selectedPlayerForArrival}
              onChange={(e) => setSelectedPlayerForArrival(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 text-white border-2 focus:outline-none"
              style={{ borderColor: '#FFD700' }}
            >
              <option value="">-- Seleccionar jugador --</option>
              {players.map((player, idx) => (
                <option key={idx} value={player}>{player}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-white mb-2 font-semibold">Hora de Llegada</label>
            <input
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 text-white border-2 focus:outline-none"
              style={{ borderColor: '#FFD700' }}
            />
          </div>
        </div>

        <button
          onClick={registerArrival}
          className="w-full py-3 rounded-lg font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
          style={{ background: '#FFD700', color: '#05080F' }}
        >
          <Save className="w-5 h-5" />
          REGISTRAR LLEGADA
        </button>

        {Object.keys(arrivals).length > 0 && (
          <div className="mt-6 bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-bold mb-3">Llegadas Registradas</h4>
            <div className="space-y-2">
              {Object.entries(arrivals)
                .sort(([,a], [,b]) => a.localeCompare(b))
                .map(([player, time]) => (
                  <div key={player} className="flex justify-between items-center text-white">
                    <span>{player}</span>
                    <span className="font-bold" style={{ color: '#FFD700' }}>{time}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Gestión de Votaciones */}
      <div className="bg-gray-900 rounded-xl p-6 border-2" style={{ borderColor: '#FFD700' }}>
        <div className="flex items-center gap-3 mb-6">
          <Vote className="w-8 h-8" style={{ color: '#FFD700' }} />
          <h3 className="text-2xl font-bold text-white">Gestión de Votaciones</h3>
        </div>

        {/* Gestión de Goles */}
        <div className="mb-6 bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-bold mb-4">Goles para Votación</h4>
          
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={newGoalDescription}
              onChange={(e) => setNewGoalDescription(e.target.value)}
              placeholder="Descripción del gol"
              className="flex-1 p-3 rounded-lg bg-gray-700 text-white border-2 focus:outline-none"
              style={{ borderColor: '#FFD700' }}
            />
            <button
              onClick={addGoal}
              className="px-6 py-3 rounded-lg font-bold flex items-center gap-2"
              style={{ background: '#FFD700', color: '#05080F' }}
            >
              <Plus className="w-5 h-5" />
              Agregar
            </button>
          </div>

          <div className="space-y-2">
            {goals.map(goal => (
              <div key={goal.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                {editingGoal === goal.id ? (
                  <>
                    <input
                      type="text"
                      value={editGoalDescription}
                      onChange={(e) => setEditGoalDescription(e.target.value)}
                      className="flex-1 p-2 rounded bg-gray-600 text-white border-2 mr-2"
                      style={{ borderColor: '#FFD700' }}
                    />
                    <button
                      onClick={() => {
                        updateGoal(goal.id, editGoalDescription);
                        setEditGoalDescription('');
                      }}
                      className="px-4 py-2 rounded bg-green-600 text-white mr-2"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingGoal(null)}
                      className="px-4 py-2 rounded bg-gray-600 text-white"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-white flex-1">{goal.description}</span>
                    <button
                      onClick={() => {
                        setEditingGoal(goal.id);
                        setEditGoalDescription(goal.description);
                      }}
                      className="p-2 bg-blue-600 rounded mr-2"
                    >
                      <Edit className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2 bg-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Control de Votaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'best_goal', name: 'Mejor Gol', icon: Star },
            { key: 'most_quiet', name: 'Más Callado', icon: UserCheck },
            { key: 'funniest', name: 'Más Chistoso', icon: Smile },
            { key: 'revelation', name: 'Jugador Revelación', icon: Zap },
            { key: 'ballon_dor', name: 'Balón d\'Or', icon: Trophy }
          ].map(voting => {
            const Icon = voting.icon;
            const results = calculateVotingResults(voting.key);
            
            return (
              <div key={voting.key} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5" style={{ color: '#FFD700' }} />
                  <h5 className="text-white font-bold">{voting.name}</h5>
                </div>
                
                {activeVoting === voting.key ? (
                  <button
                    onClick={disableVoting}
                    className="w-full py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Deshabilitar
                  </button>
                ) : (
                  <button
                    onClick={() => enableVoting(voting.key)}
                    className="w-full py-2 rounded font-bold"
                    style={{ background: '#FFD700', color: '#05080F' }}
                  >
                    Habilitar
                  </button>
                )}
                
                {results.length > 0 && (
                  <div className="mt-3 text-sm text-gray-400">
                    {results.length} votos registrados
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón de Restablecer Sistema */}
      <div className="bg-red-900 bg-opacity-20 border-2 border-red-600 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-400 mb-2">Zona de Peligro</h3>
            <p className="text-gray-300 mb-4">
              Esta acción eliminará todos los grupos, partidos, predicciones y puntajes del sistema. 
              Esta acción no se puede deshacer.
            </p>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-6 py-3 rounded-lg font-bold flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                RESTABLECER SISTEMA COMPLETO
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-red-400 font-bold">¿Estás seguro? Esta acción es irreversible.</p>
                <div className="flex gap-3">
                  <button
                    onClick={resetSystem}
                    className="px-6 py-3 rounded-lg font-bold bg-red-600 text-white hover:bg-red-700"
                  >
                    SÍ, RESTABLECER TODO
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-6 py-3 rounded-lg font-bold bg-gray-700 text-white hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gestión de Grupos */}
      <div className="bg-gray-900 rounded-xl p-6 border-2" style={{ borderColor: '#FFD700' }}>
        <h3 className="text-2xl font-bold text-white mb-6">Gestión de Grupos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-white mb-2 font-semibold">Nombre del Grupo</label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Ej: A, B, C..."
              className="w-full p-3 rounded-lg bg-gray-800 text-white border-2 focus:outline-none"
              style={{ borderColor: '#FFD700' }}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-white mb-2 font-semibold">Seleccionar Equipos</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {teams.map((team, idx) => {
              const isAssigned = assignedTeams.includes(team.team);
              const isSelected = selectedTeamsForGroup.includes(team.team);
              
              return (
                <button
                  key={idx}
                  onClick={() => !isAssigned && toggleTeamSelection(team.team)}
                  disabled={isAssigned && !isSelected}
                  className={`p-3 rounded-lg font-semibold transition-all ${isSelected ? 'scale-105' : ''}`}
                  style={{
                    background: isSelected ? '#FFD700' : isAssigned ? '#4a5568' : '#1F2937',
                    color: isSelected ? '#05080F' : isAssigned ? '#9ca3af' : 'white',
                    border: '2px solid ' + (isSelected ? '#FFD700' : isAssigned ? '#4a5568' : '#FFD700'),
                    cursor: isAssigned && !isSelected ? 'not-allowed' : 'pointer',
                    opacity: isAssigned && !isSelected ? 0.5 : 1
                  }}
                >
                  {team.team}
                  {isAssigned && !isSelected && <span className="text-xs block mt-1">(Asignado)</span>}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={createGroup}
          className="w-full py-3 rounded-lg font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
          style={{ background: '#FFD700', color: '#05080F' }}
        >
          <Plus className="w-5 h-5" />
          CREAR GRUPO Y GENERAR PARTIDOS
        </button>

        {Object.keys(groups).length > 0 && (
          <div className="mt-6">
            <h4 className="text-xl font-bold text-white mb-4">Grupos Creados</h4>
            <div className="space-y-3">
              {Object.entries(groups).map(([groupName, groupTeams]) => {
                const groupMatches = matches.filter(m => m.group === groupName);
                return (
                  <div key={groupName} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-white text-lg">Grupo {groupName}</p>
                        <p className="text-sm text-gray-400">{groupTeams.join(', ')}</p>
                        <p className="text-xs mt-2" style={{ color: '#FFD700' }}>
                          {groupMatches.length} partidos generados
                        </p>
                      </div>
                      <button
                        onClick={() => deleteGroup(groupName)}
                        className="p-2 bg-red-600 rounded-lg hover:bg-red-700"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Gestión de Partidos */}
      <div className="bg-gray-900 rounded-xl p-6 border-2" style={{ borderColor: '#FFD700' }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Gestión de Partidos</h3>
          <button
            onClick={() => setShowMatchCreator(!showMatchCreator)}
            className="px-4 py-2 rounded-lg font-bold flex items-center gap-2"
            style={{ background: '#FFD700', color: '#05080F' }}
          >
            <Plus className="w-5 h-5" />
            NUEVO PARTIDO MANUAL
          </button>
        </div>

        {showMatchCreator && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2 font-semibold">Fase</label>
                <select
                  value={matchPhase}
                  onChange={(e) => setMatchPhase(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border-2"
                  style={{ borderColor: '#FFD700' }}
                >
                  <option value="group">Grupos</option>
                  <option value="knockout">Eliminatorias</option>
                </select>
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">Grupo</label>
                <select
                  value={matchGroup}
                  onChange={(e) => setMatchGroup(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border-2"
                  style={{ borderColor: '#FFD700' }}
                >
                  <option value="">-- Seleccionar --</option>
                  {Object.keys(groups).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">Equipo 1</label>
                <select
                  value={matchTeam1}
                  onChange={(e) => setMatchTeam1(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border-2"
                  style={{ borderColor: '#FFD700' }}
                >
                  <option value="">-- Seleccionar --</option>
                  {teams.map((t, idx) => (
                    <option key={idx} value={t.team}>{t.team}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">Equipo 2</label>
                <select
                  value={matchTeam2}
                  onChange={(e) => setMatchTeam2(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border-2"
                  style={{ borderColor: '#FFD700' }}
                >
                  <option value="">-- Seleccionar --</option>
                  {teams.map((t, idx) => (
                    <option key={idx} value={t.team}>{t.team}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleCreateMatch}
              className="w-full py-3 rounded-lg font-bold"
              style={{ background: '#FFD700', color: '#05080F' }}
            >
              CREAR PARTIDO
            </button>
          </div>
        )}

        {Object.keys(groups).map(groupName => {
          const groupMatches = matches.filter(m => m.group === groupName);
          if (groupMatches.length === 0) return null;
          
          return (
            <div key={groupName} className="mb-8">
              <h4 className="text-xl font-bold mb-4" style={{ color: '#FFD700' }}>
                Grupo {groupName} - {groupMatches.length} partidos
              </h4>
              <div className="space-y-4">
                {groupMatches.map(match => (
                  <div key={match.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="text-sm mb-2" style={{ color: '#FFD700' }}>
                          {match.phase === 'group' ? `Grupo ${match.group}` : 'Eliminatorias'}
                          {match.enabled && !match.result && ' - EN VIVO'}
                          {match.result && ' - FINALIZADO'}
                        </p>
                        <p className="text-white font-bold">
                          {match.team1.team} vs {match.team2.team}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {!match.enabled && !match.result && (
                          <button
                            onClick={() => enableMatch(match.id)}
                            className="px-4 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700"
                          >
                            Habilitar
                          </button>
                        )}
                        
                        {(match.enabled || match.result) && (
                          <button
                            onClick={() => handleEditMatch(match)}
                            className="px-4 py-2 rounded-lg text-white flex items-center gap-2"
                            style={{ background: '#FFD700', color: '#05080F' }}
                          >
                            <Edit className="w-4 h-4" />
                            {match.result ? 'Editar Resultado' : 'Registrar Resultado'}
                          </button>
                        )}
                        
                        {!match.result && (
                          <button
                            onClick={() => deleteMatch(match.id)}
                            className="p-2 bg-red-600 rounded-lg hover:bg-red-700"
                          >
                            <Trash2 className="w-5 h-5 text-white" />
                          </button>
                        )}
                      </div>
                    </div>

                    {editingMatch === match.id && (
                      <div className="mt-4 bg-gray-700 p-4 rounded-lg space-y-3">
                        <div>
                          <label className="block text-white mb-2">Ganador</label>
                          <select
                            value={resultWinner}
                            onChange={(e) => setResultWinner(e.target.value)}
                            className="w-full p-2 rounded bg-gray-600 text-white border-2"
                            style={{ borderColor: '#FFD700' }}
                          >
                            <option value="">-- Seleccionar --</option>
                            <option value={match.team1.team}>{match.team1.team}</option>
                            <option value="Empate">Empate</option>
                            <option value={match.team2.team}>{match.team2.team}</option>
                          </select>
                        </div>

                        <div className="flex gap-3">
                          <input
                            type="number"
                            min="0"
                            value={resultScore1}
                            onChange={(e) => setResultScore1(e.target.value)}
                            placeholder="Goles Equipo 1"
                            className="flex-1 p-2 rounded bg-gray-600 text-white border-2"
                            style={{ borderColor: '#FFD700' }}
                          />
                          <input
                            type="number"
                            min="0"
                            value={resultScore2}
                            onChange={(e) => setResultScore2(e.target.value)}
                            placeholder="Goles Equipo 2"
                            className="flex-1 p-2 rounded bg-gray-600 text-white border-2"
                            style={{ borderColor: '#FFD700' }}
                          />
                        </div>

                        <div>
                          <label className="block text-white mb-2">Primer Goleador</label>
                          <select
                            value={resultFirstScorer}
                            onChange={(e) => setResultFirstScorer(e.target.value)}
                            className="w-full p-2 rounded bg-gray-600 text-white border-2"
                            style={{ borderColor: '#FFD700' }}
                          >
                            <option value="">-- Seleccionar --</option>
                            <option value="Sin goles">Sin goles</option>
                            <option value={match.team1.player}>{match.team1.player}</option>
                            <option value={match.team2.player}>{match.team2.player}</option>
                          </select>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRegisterResult(match.id)}
                            className="flex-1 py-2 rounded font-bold"
                            style={{ background: '#FFD700', color: '#05080F' }}
                          >
                            <Save className="inline w-4 h-4 mr-2" />
                            Guardar
                          </button>
                          <button
                            onClick={() => {
                              setEditingMatch(null);
                              setResultWinner('');
                              setResultScore1('');
                              setResultScore2('');
                              setResultFirstScorer('');
                            }}
                            className="flex-1 py-2 rounded bg-red-600 text-white"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {match.result && editingMatch !== match.id && (
                      <div className="mt-3 text-white">
                        <p><strong style={{ color: '#FFD700' }}>Resultado:</strong> {match.result.score1} - {match.result.score2}</p>
                        <p><strong style={{ color: '#FFD700' }}>Ganador:</strong> {match.result.winner}</p>
                        <p><strong style={{ color: '#FFD700' }}>Primer Gol:</strong> {match.firstGoalScorer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChampionsLeagueApp;
