import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Eye, Wind, Sparkles, BrainCircuit, MousePointer2, CircleDot, Eye as EyeIcon, MessageSquareOff } from "lucide-react";
import { toast } from "sonner";

interface RelaxationActivity {
    id: string;
    name: string;
    type: "video" | "game" | "visual";
    description: string;
    duration: string;
    icon: React.ReactNode;
    color: string;
    content: string;
}

const RelaxationHub = () => {
    const [selectedActivity, setSelectedActivity] = useState<RelaxationActivity | null>(null);
    const [isActive, setIsActive] = useState(false);

    const activities: RelaxationActivity[] = [
        {
            id: "perspective-shift",
            name: "Perspective Shift",
            type: "game",
            description: "Find clarity in chaos by changing your perspective.",
            duration: "Open-ended",
            icon: <EyeIcon className="h-5 w-5" />,
            color: "bg-indigo-600",
            content: "perspective-shift"
        },
        {
            id: "thought-tamer",
            name: "Thought Tamer",
            type: "game",
            description: "Practice identifying and taming intrusive thoughts.",
            duration: "Open-ended",
            icon: <MessageSquareOff className="h-5 w-5" />,
            color: "bg-rose-500",
            content: "thought-tamer"
        },
        {
            id: "cosmic-flow",
            name: "Cosmic Flow",
            type: "game",
            description: "Create satisfying particle flows with your movement.",
            duration: "Open-ended",
            icon: <MousePointer2 className="h-5 w-5" />,
            color: "bg-purple-500",
            content: "cosmic-flow"
        },
        {
            id: "gravity-dots",
            name: "Gravity Dots",
            type: "game",
            description: "Interactive physics - throw and bounce the dots.",
            duration: "Open-ended",
            icon: <CircleDot className="h-5 w-5" />,
            color: "bg-amber-500",
            content: "gravity-dots"
        },
        {
            id: "memory-matrix",
            name: "Memory Matrix",
            type: "game",
            description: "Train your focus to break anxiety loops.",
            duration: "Open-ended",
            icon: <BrainCircuit className="h-5 w-5" />,
            color: "bg-emerald-500",
            content: "memory-matrix"
        },
        {
            id: "breathing",
            name: "Breathing Circles",
            type: "visual",
            description: "Regulate your nervous system with guided breathing.",
            duration: "5-10 min",
            icon: <Wind className="h-5 w-5" />,
            color: "bg-blue-500",
            content: "breathing-visual"
        }
    ];

    const startActivity = (activity: RelaxationActivity) => {
        setSelectedActivity(activity);
        setIsActive(true);
        toast.success(`Started ${activity.name}`);
    };

    const stopActivity = () => {
        setSelectedActivity(null);
        setIsActive(false);
    };

    // --- Visual Components ---
    const BreathingVisual = () => (
        <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 animate-pulse delay-75"></div>
            <div className="relative z-10">
                <div className="w-32 h-32 border-4 border-white/80 rounded-full animate-breathing opacity-90 shadow-[0_0_30px_rgba(255,255,255,0.3)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white font-medium text-center">
                        <div className="text-lg font-light tracking-widest mb-1">BREATHE</div>
                        <div className="text-xs opacity-75 uppercase tracking-wider">In... Out...</div>
                    </div>
                </div>
            </div>
        </div>
    );

    // --- Game Components ---

    const PerspectiveShift = () => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const [solved, setSolved] = useState(false);

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            let animationFrameId: number;
            let angleX = Math.random() * Math.PI * 2;
            let angleY = Math.random() * Math.PI * 2;
            let isDragging = false;
            let lastMouse = { x: 0, y: 0 };

            const dots: { x: number, y: number, z: number, color: string }[] = [];
            const numDots = 400;

            // Create a "Heart" shape in 3D space
            for (let i = 0; i < numDots; i++) {
                // T parameter for parametric heart equation
                const t = (i / numDots) * Math.PI * 2;

                // Heart curve
                const x = 16 * Math.pow(Math.sin(t), 3);
                const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                const z = (Math.random() - 0.5) * 10; // Slight depth variation

                dots.push({ x: x * 4, y: y * 4, z: z, color: 'hsl(340, 100%, 70%)' });
            }

            // Add noise dots to make it look chaotic from wrong angles
            for (let i = 0; i < 200; i++) {
                dots.push({
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 200,
                    z: (Math.random() - 0.5) * 200,
                    color: 'rgba(255,255,255,0.3)'
                });
            }

            const resize = () => {
                if (canvas.parentElement) {
                    canvas.width = canvas.parentElement.clientWidth;
                    canvas.height = canvas.parentElement.clientHeight;
                }
            };
            resize();
            window.addEventListener('resize', resize);

            const project = (x: number, y: number, z: number) => {
                // Rotate Y
                const cosY = Math.cos(angleY);
                const sinY = Math.sin(angleY);
                const x1 = x * cosY - z * sinY;
                const z1 = z * cosY + x * sinY;

                // Rotate X
                const cosX = Math.cos(angleX);
                const sinX = Math.sin(angleX);
                const y2 = y * cosX - z1 * sinX;
                const z2 = z1 * cosX + y * sinX;

                // Project
                const scale = 400 / (400 + z2);
                return {
                    x: x1 * scale + canvas.width / 2,
                    y: y2 * scale + canvas.height / 2,
                    scale
                };
            };

            const animate = () => {
                ctx.fillStyle = '#0f172a'; // Slate 900
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Check alignment (target is roughly 0,0)
                // Normalizing angles to -PI to PI
                const normX = ((angleX % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
                const normY = ((angleY % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;

                const distance = Math.sqrt(normX * normX + normY * normY);
                const isAligned = distance < 0.3; // Tolerance

                if (isAligned && !solved) {
                    setSolved(true);
                    // Snap to perfect
                    angleX = angleX * 0.95;
                    angleY = angleY * 0.95;
                    if (Math.abs(angleX) < 0.01) angleX = 0;
                    if (Math.abs(angleY) < 0.01) angleY = 0;
                } else if (!isAligned) {
                    setSolved(false);
                }

                dots.forEach(dot => {
                    const p = project(dot.x, dot.y, dot.z);
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, (isAligned ? 3 : 2) * p.scale, 0, Math.PI * 2);
                    ctx.fillStyle = dot.color;
                    if (isAligned) ctx.shadowBlur = 10;
                    ctx.shadowColor = dot.color;
                    ctx.fill();
                });

                ctx.shadowBlur = 0;

                animationFrameId = requestAnimationFrame(animate);
            };

            const handleMouseDown = (e: MouseEvent) => {
                isDragging = true;
                lastMouse = { x: e.clientX, y: e.clientY };
            };

            const handleMouseMove = (e: MouseEvent) => {
                if (!isDragging || solved) return;
                const dx = e.clientX - lastMouse.x;
                const dy = e.clientY - lastMouse.y;

                angleY += dx * 0.01;
                angleX += dy * 0.01;

                lastMouse = { x: e.clientX, y: e.clientY };
            };

            const handleMouseUp = () => { isDragging = false; };

            canvas.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);

            animate();

            return () => {
                window.removeEventListener('resize', resize);
                canvas.removeEventListener('mousedown', handleMouseDown);
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                cancelAnimationFrame(animationFrameId);
            };
        }, []);

        return (
            <div className="h-96 relative overflow-hidden rounded-xl bg-slate-900 cursor-move">
                <canvas ref={canvasRef} className="absolute inset-0" />
                <div className="absolute top-4 left-4 pointer-events-none">
                    {solved ? (
                        <div className="bg-emerald-500/90 text-white px-3 py-1 rounded-full text-sm font-medium animate-bounce">
                            Clarity Found!
                        </div>
                    ) : (
                        <div className="text-white/50 text-xs">
                            Drag to rotate until the image becomes clear
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const ThoughtTamer = () => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const [score, setScore] = useState(0);

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            let animationFrameId: number;
            const thoughts: { x: number, y: number, text: string, type: 'negative' | 'positive', vx: number, radius: number, id: number }[] = [];
            const negativeWords = ["Anxiety", "Doubt", "Fear", "Stress", "Worry", "Nope"];
            const positiveWords = ["Calm", "Trust", "Courage", "Peace", "Hope", "Yes"];

            let spawnTimer = 0;
            let gameActive = true;

            const resize = () => {
                if (canvas.parentElement) {
                    canvas.width = canvas.parentElement.clientWidth;
                    canvas.height = canvas.parentElement.clientHeight;
                }
            };
            resize();
            window.addEventListener('resize', resize);

            const spawnThought = () => {
                const isNegative = true; // Always spawn negative to tame
                thoughts.push({
                    id: Math.random(),
                    x: canvas.width + 50,
                    y: 50 + Math.random() * (canvas.height - 100),
                    text: negativeWords[Math.floor(Math.random() * negativeWords.length)],
                    type: 'negative',
                    vx: -1 - Math.random() * 2, // Move left
                    radius: 30,
                });
            };

            const animate = () => {
                if (!gameActive) return;

                ctx.fillStyle = '#1e293b'; // Slate 800
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Spawn logic
                spawnTimer++;
                if (spawnTimer > 100) {
                    spawnThought();
                    spawnTimer = 0;
                }

                // Processing
                thoughts.forEach((t, i) => {
                    t.x += t.vx;

                    // Draw bubble
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
                    ctx.fillStyle = t.type === 'negative' ? '#f43f5e' : '#10b981'; // Rose or Emerald
                    ctx.fill();

                    // Text
                    ctx.fillStyle = 'white';
                    ctx.font = '14px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(t.text, t.x, t.y);

                    // Click check (handled in event listener, but checking bounds for cleanup here)
                    if (t.x < -50) {
                        thoughts.splice(i, 1);
                    }
                });

                animationFrameId = requestAnimationFrame(animate);
            };

            const handleClick = (e: MouseEvent) => {
                const rect = canvas.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;

                thoughts.forEach(t => {
                    if (t.type === 'negative') {
                        const dist = Math.sqrt((mx - t.x) ** 2 + (my - t.y) ** 2);
                        if (dist < t.radius) {
                            // TAME IT!
                            t.type = 'positive';
                            t.text = positiveWords[Math.floor(Math.random() * positiveWords.length)];
                            t.vx = Math.abs(t.vx); // Move right (away)
                            setScore(s => s + 1);

                            // Particle explosion effect could go here
                        }
                    }
                });
            };

            canvas.addEventListener('mousedown', handleClick);
            animate();

            return () => {
                gameActive = false;
                window.removeEventListener('resize', resize);
                canvas.removeEventListener('mousedown', handleClick);
                cancelAnimationFrame(animationFrameId);
            };
        }, []);

        return (
            <div className="h-96 relative overflow-hidden rounded-xl bg-slate-800">
                <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair" />
                <div className="absolute top-4 left-4 text-white font-medium">
                    Thoughts Tamed: {score}
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/50 text-xs text-center pointer-events-none">
                    Click the red thoughts to reframe them into positive ones.
                </div>
            </div>
        );
    };

    const CosmicFlow = () => {
        const canvasRef = useRef<HTMLCanvasElement>(null);

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            let animationFrameId: number;
            let particles: Array<{ x: number, y: number, vx: number, vy: number, hue: number, life: number }> = [];
            let mouse = { x: 0, y: 0 };
            let isMoving = false;

            const resize = () => {
                const parent = canvas.parentElement;
                if (parent) {
                    canvas.width = parent.clientWidth;
                    canvas.height = parent.clientHeight;
                }
            };

            resize();
            window.addEventListener('resize', resize);

            const createParticle = (x: number, y: number) => {
                const count = 3;
                for (let i = 0; i < count; i++) {
                    particles.push({
                        x, y,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        hue: Math.random() * 60 + 240, // Purple range
                        life: 100
                    });
                }
            };

            const animate = () => {
                ctx.fillStyle = 'rgba(10, 10, 30, 0.2)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                particles.forEach((p, index) => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.life -= 1.5;
                    p.vx *= 0.95;
                    p.vy *= 0.95;

                    if (p.life <= 0) {
                        particles.splice(index, 1);
                    } else {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, (p.life / 100) * 4, 0, Math.PI * 2);
                        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.life / 100})`;
                        ctx.fill();
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = `hsla(${p.hue}, 80%, 60%, 0.5)`;
                    }
                });
                ctx.shadowBlur = 0;

                if (isMoving) {
                    createParticle(mouse.x, mouse.y);
                }

                animationFrameId = requestAnimationFrame(animate);
            };

            const handleMouseMove = (e: MouseEvent) => {
                const rect = canvas.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
                isMoving = true;
            };

            const handleStop = () => { isMoving = false; };

            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseleave', handleStop);

            animate();

            return () => {
                window.removeEventListener('resize', resize);
                canvas.removeEventListener('mousemove', handleMouseMove);
                canvas.removeEventListener('mouseleave', handleStop);
                cancelAnimationFrame(animationFrameId);
            };
        }, []);

        return (
            <div className="h-96 rounded-xl relative overflow-hidden bg-[#0a0a1e] cursor-none">
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/50 text-xs pointer-events-none select-none">
                    Move your cursor to create flow
                </div>
            </div>
        );
    };

    const GravityDots = () => {
        const canvasRef = useRef<HTMLCanvasElement>(null);

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            let animationId: number;
            const gravity = 0.5;
            const friction = 0.99;
            const bounce = 0.7;
            let dragIndex = -1;

            interface Ball {
                x: number; y: number; radius: number; vx: number; vy: number; color: string;
            }

            const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6'];

            let balls: Ball[] = Array(10).fill(0).map(() => ({
                x: Math.random() * canvas.width,
                y: Math.random() * (canvas.height / 2),
                radius: 15 + Math.random() * 15,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                color: colors[Math.floor(Math.random() * colors.length)]
            }));

            const resize = () => {
                if (canvas.parentElement) {
                    canvas.width = canvas.parentElement.clientWidth;
                    canvas.height = canvas.parentElement.clientHeight;
                }
            };
            resize();
            window.addEventListener('resize', resize);

            const update = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                balls.forEach((ball, i) => {
                    if (i !== dragIndex) {
                        ball.vy += gravity;
                        ball.vx *= friction;
                        ball.vy *= friction;
                        ball.x += ball.vx;
                        ball.y += ball.vy;
                    }

                    if (ball.y + ball.radius > canvas.height) { ball.y = canvas.height - ball.radius; ball.vy *= -bounce; }
                    else if (ball.y - ball.radius < 0) { ball.y = ball.radius; ball.vy *= -bounce; }
                    if (ball.x + ball.radius > canvas.width) { ball.x = canvas.width - ball.radius; ball.vx *= -bounce; }
                    else if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.vx *= -bounce; }

                    ctx.beginPath();
                    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                    ctx.fillStyle = ball.color;
                    ctx.fill();
                });

                animationId = requestAnimationFrame(update);
            };

            const getMousePos = (e: MouseEvent) => {
                const rect = canvas.getBoundingClientRect();
                return { x: e.clientX - rect.left, y: e.clientY - rect.top };
            };

            const handleMouseDown = (e: MouseEvent) => {
                const pos = getMousePos(e);
                balls.forEach((ball, i) => {
                    const dx = pos.x - ball.x;
                    const dy = pos.y - ball.y;
                    if (Math.sqrt(dx * dx + dy * dy) < ball.radius) {
                        dragIndex = i;
                        ball.vx = 0; ball.vy = 0;
                    }
                });
            };

            const handleMouseMove = (e: MouseEvent) => {
                if (dragIndex !== -1) {
                    const pos = getMousePos(e);
                    balls[dragIndex].x = pos.x;
                    balls[dragIndex].y = pos.y;
                }
            };

            const handleMouseUp = (e: MouseEvent) => {
                if (dragIndex !== -1) {
                    const pos = getMousePos(e);
                    balls[dragIndex].vx = (pos.x - balls[dragIndex].x) * 0.5; // Fling
                    balls[dragIndex].vy = (pos.y - balls[dragIndex].y) * 0.5;
                }
                dragIndex = -1;
            };

            canvas.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);

            update();

            return () => {
                window.removeEventListener('resize', resize);
                canvas.removeEventListener('mousedown', handleMouseDown);
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                cancelAnimationFrame(animationId);
            };
        }, []);

        return (
            <div className="h-96 bg-gray-900 rounded-xl relative overflow-hidden">
                <canvas ref={canvasRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
                <div className="absolute top-4 left-4 text-white/50 text-xs pointer-events-none select-none">
                    Grab, throw, and bounce the dots
                </div>
            </div>
        );
    };

    const MemoryMatrix = () => {
        const [grid, setGrid] = useState<number[]>(Array(9).fill(0));
        const [sequence, setSequence] = useState<number[]>([]);
        const [playerSequence, setPlayerSequence] = useState<number[]>([]);
        const [gameState, setGameState] = useState<'idle' | 'showing' | 'playing' | 'gameover'>('idle');
        const [level, setLevel] = useState(1);

        // Helper to generate next step
        const addToSequence = () => {
            const next = Math.floor(Math.random() * 9);
            setSequence(prev => [...prev, next]);
        };

        // Start game
        const startGame = () => {
            setSequence([]);
            setPlayerSequence([]);
            setLevel(1);
            setGameState('showing');
            // Initial sequence
            const first = Math.floor(Math.random() * 9);
            setSequence([first]);
        };

        // Show sequence
        useEffect(() => {
            if (gameState === 'showing' && sequence.length > 0) {
                let i = 0;
                const interval = setInterval(() => {
                    if (i >= sequence.length) {
                        clearInterval(interval);
                        setGrid(Array(9).fill(0));
                        setGameState('playing');
                        return;
                    }
                    const idx = sequence[i];
                    const newGrid = Array(9).fill(0);
                    newGrid[idx] = 1; // Active
                    setGrid(newGrid);

                    setTimeout(() => {
                        setGrid(Array(9).fill(0));
                    }, 500);

                    i++;
                }, 1000);

                return () => clearInterval(interval);
            }
        }, [gameState, sequence]);

        const handleCellClick = (index: number) => {
            if (gameState !== 'playing') return;

            // Flash click
            const newGrid = [...grid];
            newGrid[index] = 1;
            setGrid(newGrid);
            setTimeout(() => setGrid(Array(9).fill(0)), 200);

            // Verify
            const expected = sequence[playerSequence.length];
            if (index === expected) {
                const newPlayerSeq = [...playerSequence, index];
                setPlayerSequence(newPlayerSeq);

                if (newPlayerSeq.length === sequence.length) {
                    // Level complete
                    toast.success("Correct! Next level.");
                    setLevel(l => l + 1);
                    setPlayerSequence([]);
                    setGameState('showing');
                    setTimeout(addToSequence, 1000);
                }
            } else {
                // Wrong
                setGameState('gameover');
                toast.error("Wrong sequence!");
            }
        };

        return (
            <div className="h-96 bg-amber-50 rounded-xl relative flex flex-col items-center justify-center">
                <div className="mb-4 flex items-center gap-4">
                    <div className="text-amber-800 font-bold">Level: {level}</div>
                    {gameState === 'idle' && <Button size="sm" onClick={startGame}>Start Game</Button>}
                    {gameState === 'gameover' && <Button size="sm" onClick={startGame} variant="destructive">Try Again</Button>}
                </div>

                <div className="grid grid-cols-3 gap-3 p-4 bg-amber-100 rounded-2xl shadow-inner">
                    {Array(9).fill(0).map((_, i) => (
                        <div
                            key={i}
                            onClick={() => handleCellClick(i)}
                            className={`
                w-20 h-20 rounded-xl transition-all duration-200 cursor-pointer
                ${grid[i] ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-105' : 'bg-amber-200/50 hover:bg-amber-200'}
              `}
                        />
                    ))}
                </div>

                <div className="mt-4 text-amber-600/60 text-xs">
                    {gameState === 'showing' ? 'Watch the sequence...' : gameState === 'playing' ? 'Repeat the pattern' : 'Test your focus'}
                </div>
            </div>
        );
    };

    const renderActivityContent = () => {
        if (!selectedActivity) return null;

        switch (selectedActivity.content) {
            case "perspective-shift": return <PerspectiveShift />;
            case "thought-tamer": return <ThoughtTamer />;
            case "cosmic-flow": return <CosmicFlow />;
            case "gravity-dots": return <GravityDots />;
            case "memory-matrix": return <MemoryMatrix />;
            case "breathing-visual": return <BreathingVisual />;
            default: return null;
        }
    };

    if (isActive && selectedActivity) {
        return (
            <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <div className={`p-1 rounded ${selectedActivity.color} text-white`}>
                                {selectedActivity.icon}
                            </div>
                            {selectedActivity.name}
                        </CardTitle>
                        <Button onClick={stopActivity} variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Exit
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {renderActivityContent()}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white/40 backdrop-blur-lg border-white/30 shadow-2xl animate-fade-in-scale">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
                    Mindful Arcade
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Engaging games designed to help you practice healthy mental habits.
                </p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activities.map((activity, index) => (
                        <div
                            key={activity.id}
                            className="group p-4 rounded-xl border-2 border-transparent bg-white/60 backdrop-blur-sm hover:border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer relative overflow-hidden"
                            style={{ animationDelay: `${index * 50}ms` }}
                            onClick={() => startActivity(activity)}
                        >
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${activity.color}`} />

                            <div className="flex flex-col h-full">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-3 rounded-2xl ${activity.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                        {activity.icon}
                                    </div>
                                    <Badge variant="secondary" className="text-xs bg-white/80">
                                        {activity.type}
                                    </Badge>
                                </div>

                                <h3 className="font-bold text-gray-800 mb-1 group-hover:text-purple-700 transition-colors">
                                    {activity.name}
                                </h3>
                                <p className="text-xs text-gray-600 mb-4 line-clamp-2 flex-1">
                                    {activity.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="text-[10px] text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-full">
                                        {activity.duration}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                        <Play className="h-3 w-3 text-gray-600 group-hover:text-purple-600 fill-current" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default RelaxationHub;
