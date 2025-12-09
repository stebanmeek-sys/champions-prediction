import React, { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, Award, Lock, Clock, Edit, Trash2, Plus, Save, ChevronDown, RefreshCw, AlertTriangle, Timer, Vote, Star, Smile, UserCheck, Zap } from 'lucide-react';
import { database } from './firebase';
import { ref, set, onValue, get } from 'firebase/database';

const ChampionsLeagueApp = () => {
  // Datos iniciales de equipos y participantes
  const teams = [
  { team: 'Liverpool', player: 'Daniel Acero' },
  { team: 'Borussia Dortmund', player: 'Miguel Ochoa' },
  { team: 'Chelsea', player: 'Santiago Belmonte' },
  { team: 'FC Barcelona', player: 'Andrés Villamizar' },
  { team: 'Newcastle United', player: 'Julian Barajas' },
  { team: 'Manchester City', player: 'Santiago Bernal' },
  { team: 'Atlético de Madrid', player: 'Sergio Sanchez' },
  { team: 'Arsenal', player: 'Juan Pablo Peña' },
  { team: 'AS Roma', player: 'Fabian Murillo' },
  { team: 'PSG', player: 'Felipe Cantor' },
  { team: 'Real Madrid', player: 'Juan Pa Villegas' },
  { team: 'Tottenham Hotspurs', player: 'Felipe Murillo' },
  { team: 'Inter de Milan', player: 'Camilo Figueroa' },
  { team: 'AC Milan', player: 'Nayo Pardo' },
  { team: 'Bayern Munich', player: 'Steban Meek' },
  { team: 'Manchester United', player: 'German Meek' },
  { team: 'SSC Napoli', player: 'Daniel Alzate' },
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
  const loadData = () => {
    const dataRef = ref(database, 'championsData');
    
    // Escuchar cambios en tiempo real
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGroups(data.groups || {});
        setMatches(data.matches || []);
        setPredictions(data.predictions || {});
        setUserPoints(data.userPoints || {});
        setArrivals(data.arrivals || {});
        setGoals(data.goals || []);
        setVotes(data.votes || {});
        setActiveVoting(data.activeVoting || null);
        setVotingStartTime(data.votingStartTime || null);
        console.log('Datos cargados desde Firebase');
      }
    });
  };

// Función para guardar datos en Firebase
const saveData = async () => {
  const dataToSave = {
    groups,
    matches,
    predictions,
    userPoints,
    arrivals,
    goals,
    votes,
    activeVoting,
    votingStartTime
  };
  
  try {
    const dataRef = ref(database, 'championsData');
    await set(dataRef, dataToSave);
    console.log('✅ Datos guardados en Firebase');
    return true; // Indica éxito
  } catch (error) {
    console.error('❌ Error al guardar datos:', error);
    alert('Error al guardar. Intenta de nuevo.');
    return false; // Indica fallo
  }
};

  // Función para sincronizar manualmente con Firebase
  const manualSync = async () => {
    const success = await saveData();
    if (success) {
      alert('✅ Datos sincronizados exitosamente!');
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
    await saveData();
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
    await saveData();
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
    await saveData();
    alert('Gol agregado exitosamente');
  };

  const updateGoal = async (goalId, newDescription) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, description: newDescription } : g));
    setEditingGoal(null);
    await saveData();
    alert('Gol actualizado exitosamente');
  };

  const deleteGoal = async (goalId) => {
    setGoals(goals.filter(g => g.id !== goalId));
    await saveData();
  };

  // Habilitar votación
  const enableVoting = async (votingType) => {
    setActiveVoting(votingType);
    setVotingStartTime(Date.now());
    await saveData();
  };

  // Deshabilitar votación
  const disableVoting = async () => {
    setActiveVoting(null);
    setVotingStartTime(null);
    await saveData();
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
    await saveData();
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
    await saveData();
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
    await saveData();
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
    await saveData();
  };

  // Habilitar partido
  const enableMatch = async (matchId) => {
    setMatches(matches.map(m => 
      m.id === matchId 
        ? { ...m, enabled: true, enabledAt: Date.now() }
        : m
    ));
    await saveData();
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
    await saveData();
  };

  // Registrar resultado del partido
  const registerResult = async (matchId, winner, score1, score2, firstScorer) => {
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
    
    setUserPoints(newPoints);
    
    // Guardar en Firebase
    await saveData();
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
  const submitPrediction = async (matchId, winner, score1, score2, firstScorer) => {
    const match = matches.find(m => m.id === matchId);
    const timeElapsed = (Date.now() - match.enabledAt) / 1000 / 60;
    
    if (timeElapsed > 3) {
      alert('El tiempo para predecir ha expirado');
      return;
    }
    
    const newPredictions = { ...predictions };
    if (!newPredictions[currentUser]) {
      newPredictions[currentUser] = {};
    }
    
    newPredictions[currentUser][matchId] = {
      winner,
      score1: parseInt(score1),
      score2: parseInt(score2),
      firstScorer
    };
    
    setPredictions(newPredictions);
    await saveData();
    alert('Predicción guardada exitosamente');
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
              <p className="text-sm text-gray-400">Predicciones 2024</p>
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
            {!isAdmin && (
              <button
                onClick={() => setActiveSection('predicciones')}
                className={`px-6 py-3 font-semibold ${activeSection === 'predicciones' ? 'border-b-4' : 'text-gray-400'}`}
                style={activeSection === 'predicciones' ? { color: '#FFD700', borderColor: '#FFD700' } : {}}
              >
                <Calendar className="inline w-5 h-5 mr-2" />
                Predicciones
              </button>
            )}

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
            
            <button
              onClick={() => setActiveSection('resultados')}
              className={`px-6 py-3 font-semibold ${activeSection === 'resultados' ? 'border-b-4' : 'text-gray-400'}`}
              style={activeSection === 'resultados' ? { color: '#FFD700', borderColor: '#FFD700' } : {}}
            >
              <Award className="inline w-5 h-5 mr-2" />
              Resultados
            </button>
            
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
          />
        )}
      </div>
    </div>
  );
};

// Componente de sección de predicciones
const PredictionsSection = ({ matches, currentUser, predictions, canEditPrediction, submitPrediction }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6">Partidos Disponibles</h2>
      
      {matches.filter(m => m.enabled && !m.result).length === 0 ? (
        <div className="bg-gray-900 p-8 rounded-xl text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">No hay partidos disponibles para predecir</p>
        </div>
      ) : (
        matches.filter(m => m.enabled && !m.result).map(match => (
          <MatchPredictionCard
            key={match.id}
            match={match}
            currentUser={currentUser}
            predictions={predictions}
            canEdit={canEditPrediction(match.id)}
            onSubmit={submitPrediction}
          />
        ))
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
const MatchPredictionCard = ({ match, currentUser, predictions, canEdit, onSubmit }) => {
  const [winner, setWinner] = useState('');
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [firstScorer, setFirstScorer] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);

  const userPrediction = predictions[currentUser]?.[match.id];

  useEffect(() => {
    if (userPrediction) {
      setWinner(userPrediction.winner);
      setScore1(userPrediction.score1);
      setScore2(userPrediction.score2);
      setFirstScorer(userPrediction.firstScorer);
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
      ) : canEdit ? (
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

          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-lg font-bold text-lg transition-all hover:scale-105"
            style={{ background: '#FFD700', color: '#05080F' }}
          >
            {userPrediction ? 'ACTUALIZAR PREDICCIÓN' : 'GUARDAR PREDICCIÓN'}
          </button>
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
const ClassificationSection = ({ classificationTab, setClassificationTab, userPoints, arrivals, groups, calculateGroupStandings, calculateVotingResults, goals, players }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6">Clasificaciones</h2>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-gray-900 p-2 rounded-xl border-2" style={{ borderColor: '#FFD700' }}>
        <button
          onClick={() => setClassificationTab('predicciones')}
          className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all text-sm ${classificationTab === 'predicciones' ? '' : 'text-gray-400'}`}
          style={classificationTab === 'predicciones' ? { background: '#FFD700', color: '#05080F' } : {}}
        >
          Predicciones
        </button>
        <button
          onClick={() => setClassificationTab('impuntual')}
          className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all text-sm ${classificationTab === 'impuntual' ? '' : 'text-gray-400'}`}
          style={classificationTab === 'impuntual' ? { background: '#FFD700', color: '#05080F' } : {}}
        >
          <Timer className="inline w-4 h-4 mr-1" />
          Impuntual
        </button>
        <button
          onClick={() => setClassificationTab('grupos')}
          className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all text-sm ${classificationTab === 'grupos' ? '' : 'text-gray-400'}`}
          style={classificationTab === 'grupos' ? { background: '#FFD700', color: '#05080F' } : {}}
        >
          Grupos
        </button>
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
      </div>

      {/* Contenido de las pestañas */}
      {classificationTab === 'predicciones' && (
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

      {classificationTab === 'impuntual' && (
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
      {classificationTab === 'mejor_gol' && (
        <VotingResultsTable 
          title="Mejor Gol"
          results={calculateVotingResults('best_goal')}
          goals={goals}
          isGoalVoting={true}
        />
      )}

      {classificationTab === 'mas_callado' && (
        <VotingResultsTable 
          title="Más Callado"
          results={calculateVotingResults('most_quiet')}
        />
      )}

      {classificationTab === 'mas_chistoso' && (
        <VotingResultsTable 
          title="Más Chistoso"
          results={calculateVotingResults('funniest')}
        />
      )}

      {classificationTab === 'revelacion' && (
        <VotingResultsTable 
          title="Jugador Revelación"
          results={calculateVotingResults('revelation')}
        />
      )}

      {classificationTab === 'ballon_dor' && (
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

// Panel de administración
const AdminPanel = (props) => {
  const {
    teams, groups, matches, newGroupName, setNewGroupName, selectedTeamsForGroup,
    toggleTeamSelection, createGroup, deleteGroup, createMatch, enableMatch, deleteMatch,
    registerResult, editingMatch, setEditingMatch, getAssignedTeams, showResetConfirm,
    setShowResetConfirm, resetSystem, players, arrivals, selectedPlayerForArrival,
    setSelectedPlayerForArrival, arrivalTime, setArrivalTime, registerArrival, goals,
    newGoalDescription, setNewGoalDescription, addGoal, updateGoal, deleteGoal, editingGoal,
    setEditingGoal, activeVoting, enableVoting, disableVoting, calculateVotingResults
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
