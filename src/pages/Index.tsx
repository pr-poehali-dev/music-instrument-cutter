import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const BACKEND_URL = 'https://functions.poehali.dev/41e2326f-ea69-482b-b292-b2a01417d858';

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<'upload' | 'editor' | 'result'>('upload');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [separationType, setSeparationType] = useState<'vocals' | 'drums' | 'bass' | 'other'>('vocals');
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setUploadedFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setActiveSection('editor');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setActiveSection('editor');
    }
  };

  const handleHeroUploadClick = () => {
    fileInputRef.current?.click();
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProcess = async (type: 'vocals' | 'drums' | 'bass' | 'other') => {
    if (!uploadedFile) return;
    
    setProcessing(true);
    setProgress(0);
    setError(null);
    setSeparationType(type);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        setProgress(20);
        
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audio: base64Audio,
            type: type,
            filename: uploadedFile.name
          })
        });
        
        setProgress(60);
        
        if (!response.ok) {
          throw new Error('Ошибка обработки аудио');
        }
        
        const data = await response.json();
        
        setProgress(90);
        
        if (data.success && data.url) {
          setProcessedUrl(data.url);
          setProgress(100);
          setTimeout(() => {
            setProcessing(false);
            setActiveSection('result');
          }, 500);
        } else {
          throw new Error('Не удалось получить обработанный файл');
        }
      };
      
      reader.onerror = () => {
        setError('Ошибка чтения файла');
        setProcessing(false);
      };
      
      reader.readAsDataURL(uploadedFile);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      setProcessing(false);
      setProgress(0);
    }
  };

  const exportFormats = ['MP3', 'WAV', 'FLAC', 'OGG', 'M4A'];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 glass">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center animate-pulse-glow">
              <Icon name="Music" className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold gradient-text">AudioCut</h1>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#upload" className="text-sm font-medium hover:text-primary transition-colors">Загрузка</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Тарифы</a>
            <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors">Инструкция</a>
          </nav>
          <Button className="gradient-primary text-white border-0">
            <Icon name="Sparkles" size={16} className="mr-2" />
            Попробовать
          </Button>
        </div>
      </header>

      <section id="hero" className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
              Изолируйте любой инструмент или голос
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Профессиональная обработка аудио с помощью ИИ. Разделяйте треки, извлекайте вокал, изолируйте инструменты за секунды.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button 
                size="lg" 
                className="gradient-primary text-white border-0 text-lg px-8 hover:scale-105 transition-transform"
                onClick={handleHeroUploadClick}
              >
                <Icon name="Upload" size={20} className="mr-2" />
                Загрузить трек
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap gap-8 justify-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Icon name="Zap" size={20} className="text-primary" />
                <span>Обработка за секунды</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Shield" size={20} className="text-primary" />
                <span>Конфиденциально</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Sparkles" size={20} className="text-primary" />
                <span>ИИ технологии</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="upload" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-4xl font-bold mb-4 text-center gradient-text">Загрузка файла</h3>
            <p className="text-center text-muted-foreground mb-12">Перетащите файл или выберите с компьютера</p>
            
            <Card 
              className={`p-12 border-2 border-dashed transition-all duration-300 glass ${
                isDragging ? 'border-primary bg-primary/5 scale-105' : 'border-border hover:border-primary/50'
              } ${uploadedFile ? 'border-primary bg-primary/5' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center ${
                  uploadedFile ? 'animate-scale-in' : ''
                }`}>
                  <Icon name={uploadedFile ? "CheckCircle2" : "Upload"} size={40} className="text-white" />
                </div>
                
                {uploadedFile ? (
                  <div className="animate-fade-in">
                    <h4 className="text-xl font-semibold mb-2">Файл загружен</h4>
                    <p className="text-muted-foreground mb-4">{uploadedFile.name}</p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => setActiveSection('editor')} className="gradient-primary text-white border-0">
                        Перейти к редактору
                        <Icon name="ArrowRight" size={16} className="ml-2" />
                      </Button>
                      <Button variant="outline" onClick={() => setUploadedFile(null)}>
                        Выбрать другой файл
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Перетащите аудиофайл сюда</h4>
                    <p className="text-muted-foreground mb-6">или нажмите кнопку ниже</p>
                    <label htmlFor="file-upload">
                      <Button className="cursor-pointer gradient-primary text-white border-0">
                        <Icon name="FolderOpen" size={20} className="mr-2" />
                        Выбрать файл
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                    <p className="text-xs text-muted-foreground mt-4">Поддерживаются: MP3, WAV, FLAC, OGG, M4A</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {uploadedFile && (
        <section id="editor" className="py-20 animate-fade-in">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-4xl font-bold mb-4 text-center gradient-text">Редактор</h3>
              <p className="text-center text-muted-foreground mb-12">Выберите, что хотите изолировать</p>
              
              <Card className="p-8 glass">
                <Tabs defaultValue="vocals" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-8">
                    <TabsTrigger value="vocals" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                      <Icon name="Mic" size={18} className="mr-2" />
                      Вокал
                    </TabsTrigger>
                    <TabsTrigger value="drums" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                      <Icon name="Radio" size={18} className="mr-2" />
                      Ударные
                    </TabsTrigger>
                    <TabsTrigger value="bass" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                      <Icon name="Music2" size={18} className="mr-2" />
                      Бас
                    </TabsTrigger>
                    <TabsTrigger value="other" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                      <Icon name="Music4" size={18} className="mr-2" />
                      Другое
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="vocals" className="space-y-6">
                    <div className="bg-muted/50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                            <Icon name="Waveform" size={24} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Изоляция вокала</h4>
                            <p className="text-sm text-muted-foreground">ИИ алгоритм извлечения голоса</p>
                          </div>
                        </div>
                        <Button onClick={() => handleProcess('vocals')} disabled={processing} className="gradient-primary text-white border-0">
                          {processing ? (
                            <>
                              <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                              Обработка...
                            </>
                          ) : (
                            <>
                              <Icon name="Play" size={18} className="mr-2" />
                              Запустить
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {processing && separationType === 'vocals' && (
                        <div className="animate-fade-in">
                          <Progress value={progress} className="mb-2" />
                          <p className="text-sm text-muted-foreground text-center">{progress}% завершено</p>
                        </div>
                      )}
                      
                      {error && separationType === 'vocals' && (
                        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <p className="text-sm text-destructive">{error}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="drums" className="space-y-6">
                    <div className="bg-muted/50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                            <Icon name="Radio" size={24} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Изоляция ударных</h4>
                            <p className="text-sm text-muted-foreground">Извлечение перкуссии и барабанов</p>
                          </div>
                        </div>
                        <Button onClick={() => handleProcess('drums')} disabled={processing} className="gradient-primary text-white border-0">
                          {processing && separationType === 'drums' ? (
                            <>
                              <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                              Обработка...
                            </>
                          ) : (
                            <>
                              <Icon name="Play" size={18} className="mr-2" />
                              Запустить
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {processing && separationType === 'drums' && (
                        <div className="animate-fade-in mt-4">
                          <Progress value={progress} className="mb-2" />
                          <p className="text-sm text-muted-foreground text-center">{progress}% завершено</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="bass" className="space-y-6">
                    <div className="bg-muted/50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                            <Icon name="Music2" size={24} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Изоляция баса</h4>
                            <p className="text-sm text-muted-foreground">Низкочастотные инструменты</p>
                          </div>
                        </div>
                        <Button onClick={() => handleProcess('bass')} disabled={processing} className="gradient-primary text-white border-0">
                          {processing && separationType === 'bass' ? (
                            <>
                              <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                              Обработка...
                            </>
                          ) : (
                            <>
                              <Icon name="Play" size={18} className="mr-2" />
                              Запустить
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {processing && separationType === 'bass' && (
                        <div className="animate-fade-in mt-4">
                          <Progress value={progress} className="mb-2" />
                          <p className="text-sm text-muted-foreground text-center">{progress}% завершено</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="other" className="space-y-6">
                    <div className="bg-muted/50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                            <Icon name="Music4" size={24} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Другие инструменты</h4>
                            <p className="text-sm text-muted-foreground">Гитары, клавишные, струнные</p>
                          </div>
                        </div>
                        <Button onClick={() => handleProcess('other')} disabled={processing} className="gradient-primary text-white border-0">
                          {processing && separationType === 'other' ? (
                            <>
                              <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                              Обработка...
                            </>
                          ) : (
                            <>
                              <Icon name="Play" size={18} className="mr-2" />
                              Запустить
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {processing && separationType === 'other' && (
                        <div className="animate-fade-in mt-4">
                          <Progress value={progress} className="mb-2" />
                          <p className="text-sm text-muted-foreground text-center">{progress}% завершено</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'result' && (
        <section id="result" className="py-20 bg-muted/30 animate-fade-in">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-4xl font-bold mb-4 text-center gradient-text">Результат</h3>
              <p className="text-center text-muted-foreground mb-12">Ваш обработанный трек готов</p>
              
              <Card className="p-8 glass">
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center">
                      <Icon name="Music" size={32} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold">{uploadedFile?.name}</h4>
                      <p className="text-muted-foreground">
                        {separationType === 'vocals' && 'Вокал изолирован'}
                        {separationType === 'drums' && 'Ударные изолированы'}
                        {separationType === 'bass' && 'Бас изолирован'}
                        {separationType === 'other' && 'Инструменты изолированы'}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="rounded-full w-12 h-12 p-0"
                      onClick={togglePlayPause}
                    >
                      <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
                    </Button>
                  </div>
                  {processedUrl && (
                    <audio 
                      ref={audioRef} 
                      src={processedUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="w-full"
                      controls
                    />
                  )}
                </div>
                
                <div className="mb-8">
                  <h5 className="font-semibold mb-4">Выберите формат для экспорта:</h5>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {exportFormats.map((format) => (
                      <Button
                        key={format}
                        variant="outline"
                        className="hover:gradient-primary hover:text-white hover:border-0 transition-all"
                      >
                        {format}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 gradient-primary text-white border-0"
                    onClick={() => {
                      if (processedUrl) {
                        const a = document.createElement('a');
                        a.href = processedUrl;
                        a.download = `${separationType}_${uploadedFile?.name || 'track.mp3'}`;
                        a.click();
                      }
                    }}
                    disabled={!processedUrl}
                  >
                    <Icon name="Download" size={20} className="mr-2" />
                    Скачать
                  </Button>
                  <Button variant="outline">
                    <Icon name="Share2" size={20} className="mr-2" />
                    Поделиться
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>
      )}

      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-4xl font-bold mb-4 text-center gradient-text">Тарифы</h3>
            <p className="text-center text-muted-foreground mb-12">Выберите подходящий план для ваших задач</p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-8 glass hover:scale-105 transition-transform">
                <div className="mb-6">
                  <h4 className="text-2xl font-bold mb-2">Базовый</h4>
                  <p className="text-muted-foreground mb-4">Для пробы сервиса</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold gradient-text">Бесплатно</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-primary mt-0.5" />
                    <span className="text-sm">3 обработки в месяц</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-primary mt-0.5" />
                    <span className="text-sm">Треки до 5 минут</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-primary mt-0.5" />
                    <span className="text-sm">Экспорт MP3 320kbps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-primary mt-0.5" />
                    <span className="text-sm">Базовая поддержка</span>
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full">
                  Начать бесплатно
                </Button>
              </Card>

              <Card className="p-8 glass hover:scale-105 transition-transform border-2 border-primary relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-white border-0">
                  Популярный
                </Badge>
                
                <div className="mb-6">
                  <h4 className="text-2xl font-bold mb-2">Профи</h4>
                  <p className="text-muted-foreground mb-4">Для музыкантов</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold gradient-text">990₽</span>
                    <span className="text-muted-foreground">/месяц</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-primary mt-0.5" />
                    <span className="text-sm">50 обработок в месяц</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-primary mt-0.5" />
                    <span className="text-sm">Без ограничений по времени</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-primary mt-0.5" />
                    <span className="text-sm">Все форматы экспорта</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-primary mt-0.5" />
                    <span className="text-sm">Приоритетная поддержка</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-primary mt-0.5" />
                    <span className="text-sm">Пакетная обработка</span>
                  </li>
                </ul>
                
                <Button className="w-full gradient-primary text-white border-0">
                  Оформить подписку
                </Button>
              </Card>

              <Card className="p-8 glass hover:scale-105 transition-transform">
                <div className="mb-6">
                  <h4 className="text-2xl font-bold mb-2">Студия</h4>
                  <p className="text-muted-foreground mb-4">Для профессионалов</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold gradient-text">2990₽</span>
                    <span className="text-muted-foreground">/месяц</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-primary mt-0.5" />
                    <span className="text-sm">Безлимитные обработки</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-primary mt-0.5" />
                    <span className="text-sm">API доступ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-primary mt-0.5" />
                    <span className="text-sm">Все форматы + стемы</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-primary mt-0.5" />
                    <span className="text-sm">Персональный менеджер</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-primary mt-0.5" />
                    <span className="text-sm">Коммерческая лицензия</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={20} className="text-primary mt-0.5" />
                    <span className="text-sm">Собственный сервер</span>
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full">
                  Связаться с нами
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-4xl font-bold mb-4 text-center gradient-text">Инструкция</h3>
            <p className="text-center text-muted-foreground mb-12">Часто задаваемые вопросы</p>
            
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="glass rounded-xl px-6 border-0">
                <AccordionTrigger className="text-left font-semibold">
                  Как загрузить аудиофайл?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Перетащите файл в зону загрузки или нажмите кнопку "Выбрать файл". Поддерживаются форматы MP3, WAV, FLAC, OGG, M4A.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="glass rounded-xl px-6 border-0">
                <AccordionTrigger className="text-left font-semibold">
                  Сколько времени занимает обработка?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Обычно обработка занимает от 10 до 30 секунд в зависимости от длительности трека и сложности композиции.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="glass rounded-xl px-6 border-0">
                <AccordionTrigger className="text-left font-semibold">
                  В каких форматах можно экспортировать?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Доступны следующие форматы экспорта: MP3, WAV, FLAC, OGG, M4A. Выберите нужный формат перед скачиванием.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="glass rounded-xl px-6 border-0">
                <AccordionTrigger className="text-left font-semibold">
                  Безопасны ли мои файлы?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Да, все файлы обрабатываются конфиденциально и автоматически удаляются после завершения работы. Мы не сохраняем и не передаём ваши данные третьим лицам.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 glass">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Icon name="Music" className="text-white" size={18} />
              </div>
              <span className="font-semibold">AudioCut</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 AudioCut. Все права защищены.</p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Icon name="Twitter" size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Icon name="Instagram" size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Icon name="Youtube" size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;