import React, { useState } from 'react';
import {
  X,
  Flag,
  Volume2,
  Star,
  CheckCircle,
  XCircle,
  Turtle,
  ThumbsUp,
  EarOff,
  MicOff,
  Mic,
  Square,
  RotateCw } from
'lucide-react';
interface LessonFlowProps {
  onClose: () => void;
}
export function LessonFlow({ onClose }: LessonFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [showGrammarHint, setShowGrammarHint] = useState(false);
  const [slowAudioActive, setSlowAudioActive] = useState(false);
  const [knownWord, setKnownWord] = useState(false);
  const [translationInput, setTranslationInput] = useState('');
  const [comprehensionInput, setComprehensionInput] = useState('');
  const [comprehensionChoice, setComprehensionChoice] = useState<string | null>(
    null
  );
  const [isRecording, setIsRecording] = useState(false);
  const totalSteps = 5;
  const progressPercent = (currentStep + 1) / totalSteps * 100;
  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
      setSelectedOption(null);
      setHasChecked(false);
    } else if (currentStep === 1) {
      if (!hasChecked && selectedOption) {
        setHasChecked(true);
      } else if (hasChecked) {
        setCurrentStep(2);
        setHasChecked(false);
      }
    } else if (currentStep === 2) {
      if (!hasChecked && translationInput) {
        setHasChecked(true);
      } else if (hasChecked || !translationInput) {
        // Allow skip if empty
        setCurrentStep(3);
        setHasChecked(false);
        setTranslationInput('');
      }
    } else if (currentStep === 3) {
      if (!hasChecked) {
        setHasChecked(true);
        setIsRecording(false);
      } else {
        setCurrentStep(4);
        setHasChecked(false);
      }
    } else if (currentStep === 4) {
      if (!hasChecked && (comprehensionInput || comprehensionChoice)) {
        setHasChecked(true);
      } else if (hasChecked) {
        onClose();
      }
    }
  };
  const handleOptionClick = (option: string) => {
    if (hasChecked) return;
    setSelectedOption(option);
  };
  const getOptionState = (option: string): 'clear' | 'correct' | 'wrong' => {
    if (!hasChecked) return 'clear';
    if (option === 'Desayuno') return 'correct';
    if (option === selectedOption && option !== 'Desayuno') return 'wrong';
    return 'clear';
  };
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center font-inter"
      style={{
        background:
        'radial-gradient(circle at top right, #FF1500 0%, #FFD905 100%)'
      }}>
      
      <div className="w-full max-w-[684px] min-h-[688px] relative flex flex-col p-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors">
            
            <X className="w-6 h-6 text-[#FFFDE6]" />
          </button>

          {/* Progress Bar */}
          <div className="flex-1 mx-8 h-3 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FFFDE6] rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`
              }} />
            
          </div>

          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Flag className="w-6 h-6 text-[#FFFDE6]" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center">
          {/* Step 0: Flashcard */}
          {currentStep === 0 &&
          <div className="w-full max-w-[557px] flex flex-col items-center">
              {/* Badge */}
              <div className="px-4 py-1 border border-[#FFFDE6] rounded-full mb-8">
                <span className="font-inter font-medium text-[14px] leading-[16px] text-[#FFFDE6] uppercase tracking-wider">
                  Flashcard
                </span>
              </div>

              {/* Card */}
              <div className="w-full max-w-[422px] bg-[#FFFDE6] rounded-2xl p-8 flex flex-col items-center relative shadow-lg mb-8">
                <img
                src="/240-158.png"
                alt="Breakfast"
                className="w-[235px] h-[157px] object-cover rounded-lg mb-12" />
              

                {/* Speaker Button */}
                <button className="absolute top-[180px] w-16 h-16 bg-white border-4 border-[#FF4D01] rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                  <Volume2 className="w-8 h-8 text-[#FF4D01]" />
                </button>

                <h2 className="font-inter font-bold text-[24px] leading-[48px] text-black mb-1">
                  Desayuno
                </h2>
                <span className="font-inter font-medium text-[20px] leading-[20px] text-[#FF4D01]">
                  Breakfast
                </span>

                {/* Bottom Icons */}
                <button
                onClick={() => setKnownWord(!knownWord)}
                title={
                knownWord ? 'Marked as known' : 'Mark as already known'
                }
                className={`absolute bottom-0 left-0 w-12 h-10 rounded-tr-2xl rounded-bl-2xl flex items-center justify-center transition-colors ${knownWord ? 'bg-[#3BBC00]' : 'bg-[#FF4D01]'}`}>
                
                  <ThumbsUp className="w-5 h-5 text-[#FFFDE6]" />
                </button>
                <button
                onClick={() => setSlowAudioActive(!slowAudioActive)}
                title={
                slowAudioActive ? 'Normal speed audio' : 'Play audio slowly'
                }
                className={`absolute bottom-0 right-0 w-12 h-10 rounded-tl-2xl rounded-br-2xl flex items-center justify-center transition-colors ${slowAudioActive ? 'bg-[#3BBC00]' : 'bg-[#FF4D01]'}`}>
                
                  <Turtle className="w-5 h-5 text-[#FFFDE6]" />
                </button>
              </div>

              {/* Example Sentence */}
              <div className="text-center">
                <p className="font-inter font-medium italic text-[16.3px] leading-[28px] text-[#FFFDE6] mb-1">
                  " El desayuno es a las ocho. "
                </p>
                <p className="font-inter italic text-[14.6px] leading-[24px] text-[#FFFDE6]">
                  Breakfast is at eight.
                </p>
              </div>
            </div>
          }

          {/* Step 1: Multiple Choice */}
          {currentStep === 1 &&
          <div className="w-full max-w-[557px] flex flex-col items-center">
              {/* Badge */}
              <div className="px-4 py-1 border border-[#FFFDE6] rounded-full mb-8">
                <span className="font-inter font-medium text-[14px] leading-[16px] text-[#FFFDE6] uppercase tracking-wider">
                  VOCAB & TRANSLATION
                </span>
              </div>

              {/* Image Card */}
              <div className="w-full max-w-[422px] bg-transparent rounded-2xl flex flex-col items-center mb-8">
                <img
                src="/416-153.png"
                alt="Breakfast"
                className="w-[350px] h-[233px] object-cover rounded-lg mb-6 shadow-lg" />
              
                <h2 className="font-inter font-bold text-[24px] leading-[20px] text-[#FFFDE6]">
                  Breakfast
                </h2>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-[448px]">
                {['Desayuno', 'Almuerzo', 'Cena', 'Merienda'].map((option) => {
                const state = getOptionState(option);
                const isSelected = selectedOption === option && !hasChecked;
                let buttonClasses = '';
                if (state === 'correct') {
                  buttonClasses =
                  'border-2 border-[#3BBC00] bg-[#3BBC00] text-[#FFFDE6]';
                } else if (state === 'wrong') {
                  buttonClasses =
                  'border-2 border-[#FF3725] bg-[#FF3725] text-[#FFFDE6]';
                } else if (isSelected) {
                  buttonClasses =
                  'border-2 border-white bg-transparent text-[#FFFDE6]';
                } else {
                  buttonClasses =
                  'border-2 border-[#FFFDE6] bg-transparent text-[#FFFDE6]';
                }
                return (
                  <button
                    key={option}
                    onClick={() => handleOptionClick(option)}
                    disabled={hasChecked}
                    className={`h-16 rounded-xl font-inter font-semibold text-[18px] leading-[28px] transition-all flex items-center justify-center gap-2 ${buttonClasses} ${!hasChecked ? 'hover:bg-white/10' : ''}`}>
                    
                      {state === 'correct' &&
                    <CheckCircle className="w-9 h-9 text-white" />
                    }
                      {state === 'wrong' &&
                    <XCircle className="w-9 h-9 text-white" />
                    }
                      {option}
                    </button>);

              })}
              </div>
            </div>
          }

          {/* Step 2: Listen & Write */}
          {currentStep === 2 &&
          <div className="w-full max-w-[557px] flex flex-col items-center">
              {/* Badge */}
              <div className="px-4 py-1 border border-[#FFFDE6] rounded-full mb-8">
                <span className="font-inter font-medium text-[14px] leading-[16px] text-[#FFFDE6] uppercase tracking-wider">
                  LISTENING & WRITING
                </span>
              </div>

              {/* Card */}
              <div
              className="w-full max-w-[422px] h-[325px] rounded-2xl relative mb-8 flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(to right, #FFEC2B, #FF5E5E)'
              }}>
              
                {/* Speaker Button */}
                <button className="relative z-10 w-20 h-20 bg-white border-4 border-[#FF4D01] rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                  <Volume2 className="w-10 h-10 text-[#FF4D01]" />
                </button>

                {/* Turtle Button */}
                <button
                onClick={() => setSlowAudioActive(!slowAudioActive)}
                title={
                slowAudioActive ? 'Normal speed audio' : 'Play audio slowly'
                }
                className={`absolute bottom-0 right-0 w-12 h-10 rounded-tl-2xl rounded-br-2xl flex items-center justify-center transition-colors ${slowAudioActive ? 'bg-[#3BBC00]' : 'bg-[#FF4D01]'}`}>
                
                  <Turtle className="w-5 h-5 text-[#FFFDE6]" />
                </button>
              </div>

              {/* Input */}
              <div className="w-full max-w-[448px] relative">
                <input
                type="text"
                value={translationInput}
                onChange={(e) => setTranslationInput(e.target.value)}
                placeholder="Translate to English..."
                disabled={hasChecked}
                className={`w-full h-16 px-5 pr-12 rounded-xl font-inter text-[18px] text-[#372213] placeholder:text-[#C8B89B] focus:outline-none transition-colors border-2 ${hasChecked ? translationInput.toLowerCase().trim().includes('hello') || translationInput.toLowerCase().trim().includes('hi') ? 'bg-[#BEFFA1] border-[#3BBC00]' : 'bg-[#FFB4AD] border-[#FF3725]' : 'bg-white border-[#E5E7EB] focus:border-[#FF4D01]'}`} />
              
                <img
                src="/424-583.svg"
                alt="Keyboard"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
              
              </div>

              {/* Validation Feedback (Wrong Answer) */}
              {hasChecked &&
            !translationInput.toLowerCase().trim().includes('hello') &&
            !translationInput.toLowerCase().trim().includes('hi') &&
            <div className="w-full max-w-[448px] flex flex-col items-center mt-6 gap-4">
                    <p className="font-inter font-bold text-[15.3px] leading-[28px] text-black text-center">
                      Correct Answer: Hello
                    </p>
                    <button className="flex items-center gap-2 px-4 py-2 border border-white rounded-lg shadow-md hover:bg-white/10 transition-colors">
                      <Star className="w-4 h-4 text-white" />
                      <span className="font-inter font-bold text-[14.6px] leading-[20px] text-white">
                        Pronunciation Hint
                      </span>
                    </button>
                  </div>
            }
            </div>
          }

          {/* Step 3: Speaking */}
          {currentStep === 3 &&
          <div className="w-full max-w-[557px] flex flex-col items-center">
              {/* Badge */}
              <div className="px-4 py-1 border border-[#FFFDE6] rounded-full mb-8">
                <span className="font-inter font-medium text-[14px] leading-[16px] text-[#FFFDE6] uppercase tracking-wider">
                  SPEAKING
                </span>
              </div>

              {/* Image */}
              <img
              src="/439-265.png"
              alt="Speaking Practice"
              className="w-[350px] h-[233px] object-cover rounded-lg mb-8 shadow-lg" />
            

              {/* Phrase */}
              <h2 className="font-inter font-bold text-[24px] leading-[20px] text-[#FFFDE6] mb-8">
                " Hola "
              </h2>

              {/* Mic / Retry Button */}
              <button
              onClick={() => {
                if (hasChecked) {
                  setHasChecked(false);
                  setIsRecording(false);
                } else {
                  setIsRecording(!isRecording);
                }
              }}
              className={`w-[75px] h-[75px] bg-white rounded-full flex items-center justify-center shadow-lg transition-all mb-4 hover:scale-105 ${isRecording && !hasChecked ? 'animate-pulse' : ''}`}>
              
                {hasChecked ?
              <RotateCw className="w-8 h-8 text-[#FF4D01]" /> :
              isRecording ?
              <Square className="w-7 h-7 text-[#FF4D01] fill-current" /> :

              <Mic className="w-8 h-8 text-[#FF4D01]" />
              }
              </button>

              {/* Instruction / Feedback */}
              {!hasChecked ?
            <p className="font-inter font-medium text-[15.6px] leading-[24px] text-white">
                  {isRecording ?
              'Analysing...' :
              'Tap the mic & say the phrase'}
                </p> :

            <div
              className="w-full max-w-[448px] border border-white rounded-lg p-4 shadow-lg mt-4"
              style={{
                boxShadow: '0px 4px 4px rgba(0,0,0,0.25)'
              }}>
              
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-[#FFFDE6] fill-current" />
                    <span className="font-inter font-bold text-[15px] leading-[20px] text-white">
                      Pronunciation Feedback Score: 80%
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="font-inter font-bold text-[14.6px] leading-[20px] text-white">
                      Comments:
                    </p>
                    <p className="font-inter text-[14.6px] leading-[20px] text-white pl-4">
                      • ...
                    </p>
                    <p className="font-inter font-bold text-[14.6px] leading-[20px] text-white mt-2">
                      Remember:
                    </p>
                    <p className="font-inter text-[14.6px] leading-[20px] text-white pl-4">
                      • 'h' sounds are....
                    </p>
                  </div>
                </div>
            }
            </div>
          }

          {/* Step 4: Convo & Comprehension */}
          {currentStep === 4 &&
          <div className="w-full max-w-[557px] flex flex-col items-center">
              {/* Badge */}
              <div className="px-4 py-1 border border-[#FFFDE6] rounded-full mb-4">
                <span className="font-inter font-medium text-[14px] leading-[16px] text-[#FFFDE6] uppercase tracking-wider">
                  CONVO & COMPREHENSION
                </span>
              </div>

              <h2 className="font-inter font-bold text-[15.3px] leading-[28px] text-[#FFFDE6] mb-1">
                Understand the Conversation
              </h2>
              <p className="font-inter text-[11.9px] leading-[20px] text-[#FFFDE6] text-center mb-8">
                Listen to the conversation, without seeing the words, and answer
                the questions
              </p>

              {/* Speaker Button */}
              <button className="w-[52px] h-[52px] bg-white border-2 border-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform mb-8">
                <Volume2 className="w-6 h-6 text-[#FF4D01]" />
              </button>

              {/* Chat Container */}
              <div className="w-full max-w-[512px] flex flex-col gap-4 mb-8">
                {/* Pedro Message */}
                <div className="flex items-start gap-3">
                  <img
                  src="/437-176.png"
                  alt="Pedro"
                  className="w-[58px] h-[58px] rounded-full object-cover bg-gray-200" />
                
                  <div className="bg-[#FFFDE6] rounded-2xl rounded-tl-none p-4 flex flex-col gap-2 min-w-[160px]">
                    <span className="font-inter font-bold text-[10.2px] text-[#372213]">
                      Pedro
                    </span>
                    {hasChecked ?
                  <p className="font-inter text-[13.6px] leading-[24px] text-[#372213]">
                        ¡Hola! ¿Cómo estás?
                      </p> :

                  <div
                    className="w-[132px] h-[21px] rounded-lg"
                    style={{
                      background:
                      'linear-gradient(to right, #FFED2A, #FF5D5D)'
                    }} />

                  }
                  </div>
                </div>

                {/* Carla Message */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-[#FFDD57] rounded-2xl rounded-tr-none p-4 flex flex-col gap-2 min-w-[300px]">
                    <span className="font-inter font-bold text-[10.2px] text-[#372213]">
                      Carla
                    </span>
                    {hasChecked ?
                  <div>
                        <p className="font-inter text-[13.6px] leading-[24px] text-[#372213]">
                          Estoy un poco cansado, pero contento de estar aquí.
                        </p>
                        <p className="font-inter text-[13.6px] leading-[24px] text-[#372213]">
                          ¿Y tú?
                        </p>
                      </div> :

                  <>
                        <div
                      className="w-[339px] h-[21px] rounded-lg"
                      style={{
                        background:
                        'linear-gradient(to right, #FFED2A, #FF5D5D)'
                      }} />
                    
                        <div
                      className="w-[167px] h-[21px] rounded-lg"
                      style={{
                        background:
                        'linear-gradient(to right, #FFED2A, #FF5D5D)'
                      }} />
                    
                      </>
                  }
                  </div>
                  <img
                  src="/437-220.png"
                  alt="Carla"
                  className="w-[58px] h-[58px] rounded-full object-cover bg-[#F3E8FF]" />
                
                </div>

                {/* Pedro Message 2 */}
                <div className="flex items-start gap-3">
                  <img
                  src="/451-163.png"
                  alt="Pedro"
                  className="w-[58px] h-[58px] rounded-full object-cover bg-gray-200" />
                
                  <div className="bg-[#FFFDE6] rounded-2xl rounded-tl-none p-4 flex flex-col gap-2 min-w-[232px]">
                    <span className="font-inter font-bold text-[10.2px] text-[#372213]">
                      Pedro
                    </span>
                    {hasChecked ?
                  <p className="font-inter text-[13.6px] leading-[24px] text-[#372213]">
                        Muy bien, gracias.
                      </p> :

                  <div
                    className="w-[198px] h-[21px] rounded-lg"
                    style={{
                      background:
                      'linear-gradient(to right, #FFED2A, #FF5D5D)'
                    }} />

                  }
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="w-full max-w-[436px] flex flex-col gap-4">
                {/* Question 1 */}
                <div className="bg-[#FFFDE6] border border-[#E5E7EB] rounded-xl p-5 relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#FFF4A2] rounded-full flex items-center justify-center font-inter font-bold text-[16.2px] text-[#372213] shadow-sm">
                    1
                  </div>
                  <h3 className="font-inter font-bold text-[13.6px] text-[#372213] mb-4 ml-2">
                    How is Carla feeling? (In English)
                  </h3>
                  {hasChecked ?
                <div className="flex flex-col gap-3">
                      <p className="font-inter text-[17px] leading-[28px] text-[#372213]">
                        {comprehensionInput || '(No answer)'}
                      </p>
                      <div className="p-3 rounded-lg border-2 border-[#FFB4AD] bg-[#FFB4AD]">
                        <p className="font-inter font-medium text-[13.5px] leading-[20px] text-[#372213]">
                          Not Quite – Carla said "un poco cansado, pero contento
                          de estar aquí" so correct answers would be:{'\n'}
                          <span className="font-bold">
                            a little bit tired / a bit tired / tired / tired but
                            happy to be here / ...
                          </span>
                        </p>
                      </div>
                    </div> :

                <div className="relative">
                      <input
                    type="text"
                    value={comprehensionInput}
                    onChange={(e) => setComprehensionInput(e.target.value)}
                    placeholder="Type in English..."
                    className="w-full h-14 px-4 pr-10 bg-white border-2 border-[#D5C4A5] rounded-lg font-inter text-[17px] text-[#372213] placeholder:text-[#C8B89B] focus:outline-none focus:border-[#FF4D01]" />
                  
                      <img
                    src="/424-485.svg"
                    alt="Keyboard"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                  
                    </div>
                }
                </div>

                {/* Question 2 */}
                <div className="bg-[#FFFDE6] border border-[#E5E7EB] rounded-xl p-5 relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#FFF4A2] rounded-full flex items-center justify-center font-inter font-bold text-[16.2px] text-[#372213] shadow-sm">
                    2
                  </div>
                  <h3 className="font-inter font-bold text-[13.6px] text-[#372213] mb-4 ml-2">
                    What did Carla offer Pedro?
                  </h3>
                  <div className="flex flex-col gap-2">
                    {[
                  'A dance',
                  'A drink',
                  'To leave the party',
                  'Some food'].
                  map((option) => {
                    const isCorrect = option === 'A drink';
                    const isSelected = comprehensionChoice === option;
                    let optionClasses =
                    'border-[#D5C4A5] bg-transparent text-[#372213]';
                    if (hasChecked) {
                      if (isCorrect) {
                        optionClasses =
                        'border-[#BEFFA1] bg-[#BEFFA1] text-[#372213]';
                      } else if (isSelected && !isCorrect) {
                        optionClasses =
                        'border-[#FFB4AD] bg-[#FFB4AD] text-[#372213]';
                      } else {
                        optionClasses =
                        'border-[#D5C4A5] bg-transparent text-[#372213]';
                      }
                    } else if (isSelected) {
                      optionClasses =
                      'border-[#FF4D01] bg-[#FFF9B5] text-[#FF4D01]';
                    }
                    return (
                      <button
                        key={option}
                        onClick={() =>
                        !hasChecked && setComprehensionChoice(option)
                        }
                        disabled={hasChecked}
                        className={`w-full h-12 px-4 text-left rounded-lg border-2 transition-colors font-inter font-medium text-[11.9px] ${optionClasses} ${!hasChecked ? 'hover:bg-black/5' : ''}`}>
                        
                          {option}
                        </button>);

                  })}
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        {/* Bottom Actions */}
        <div
          className={`flex items-center mt-8 w-full max-w-[448px] mx-auto relative ${currentStep === 2 || currentStep === 3 ? 'justify-between' : 'justify-between'}`}>
          
          {/* Left side: Grammar Hint (step 0) or Skip (other steps, hidden after check on step 4) */}
          {currentStep === 0 ?
          <div className="relative">
              <button
              onClick={() => setShowGrammarHint(!showGrammarHint)}
              className="flex items-center gap-2 px-4 py-3 border-2 border-[#FFFDE6] rounded-xl bg-[#FF6200] text-[#FFFDE6] font-inter font-bold text-[14.6px] hover:bg-[#e55800] transition-colors">
              
                <Star className="w-4 h-4" />
                Grammar Hint
              </button>

              {/* Grammar Hint Popup */}
              {showGrammarHint &&
            <div className="absolute bottom-full left-0 mb-4 w-[280px] bg-[#FFFDE6] rounded-xl p-4 shadow-xl z-50">
                  <div className="absolute -bottom-2 left-8 w-4 h-4 bg-[#FFFDE6] rotate-45" />
                  <p className="font-inter text-[14px] leading-[20px] text-[#372213] relative z-10">
                    <span className="font-bold">Desayuno</span> is a masculine
                    noun. In Spanish, meals of the day are typically masculine:
                    el desayuno, el almuerzo, la cena (exception!).
                  </p>
                </div>
            }
            </div> :
          hasChecked ?
          <div /> :

          <button
            onClick={() => {
              if (currentStep < totalSteps - 1) {
                setCurrentStep(currentStep + 1);
                setHasChecked(false);
                setTranslationInput('');
                setIsRecording(false);
              } else {
                onClose();
              }
            }}
            className="px-6 py-3 border-2 border-[#FFFDE6] rounded-xl bg-[#FF6200] text-[#FFFDE6] font-inter font-bold text-[14.6px] hover:bg-[#e55800] transition-colors">
            
              Skip
            </button>
          }

          {/* Middle Button for Step 2 and 3 */}
          {currentStep === 2 && !hasChecked &&
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-white rounded-lg hover:bg-gray-50 transition-colors">
              <EarOff className="w-5 h-5 text-[#372213]" />
              <span className="font-inter text-[16px] leading-[20px] tracking-[0.3px] text-[#372213]">
                Disable listening
              </span>
            </button>
          }

          {currentStep === 3 && !hasChecked &&
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-white rounded-lg hover:bg-gray-50 transition-colors">
              <MicOff className="w-5 h-5 text-[#372213]" />
              <span className="font-inter text-[15px] leading-[20px] tracking-[0.3px] text-[#372213]">
                Disable speaking
              </span>
            </button>
          }

          <button
            onClick={handleNext}
            disabled={
            currentStep === 1 && !selectedOption ||
            currentStep === 2 && !translationInput && !hasChecked ||
            currentStep === 4 &&
            !comprehensionInput &&
            !comprehensionChoice &&
            !hasChecked
            }
            className={`px-8 py-3 bg-[#FFFDE6] rounded-xl text-[#FF4D01] font-inter font-bold text-[14.6px] hover:bg-white transition-colors shadow-lg ${currentStep === 1 && !selectedOption || currentStep === 2 && !translationInput && !hasChecked || currentStep === 4 && !comprehensionInput && !comprehensionChoice && !hasChecked ? 'opacity-50 cursor-not-allowed' : ''} ${hasChecked ? 'mx-auto' : ''}`}>
            
            {currentStep === 0 ? 'Next' : hasChecked ? 'Next' : 'Check'}
          </button>
        </div>
      </div>
    </div>);

}