import { useState } from 'react';
import { ThreeJSCursor } from './components/ThreeJSCursor';
import svgPaths from "./imports/svg-u4ngvccw05";
import imgFrame1948755292 from "figma:asset/cc09be3e67952fcdb796efa0bbee7c5dfdabc7da.png";
import imgDsc039441 from "figma:asset/45e0e97b19a0dec3b450637eb2f26870741005ea.png";
import imgFrame1948755289 from "figma:asset/7a91ef584d90f37c4f0d97167a6a229de00ab572.png";
import imgFrame1948755290 from "figma:asset/0d9a9a81b8dc18e16e4f07dcce311152ea40208e.png";
import imgFrame1948755291 from "figma:asset/0700528532ca7c81c9a3be0b534e4231401a602b.png";
import imgFrame1948755293 from "figma:asset/db4e79dc9c51b54c70d625efdc35b4abc4e8abd5.png";
import imgFrame1948755294 from "figma:asset/43dac2fe696d54961ee52eef76128c3702d5a829.png";
import imgFrame1948755295 from "figma:asset/c522c26c43607988b4e560da7bacb52dd119d8f5.png";
import imgFrame1948755296 from "figma:asset/5f208e5f941d5b46d2f082d2d1b435ae04db1f7c.png";
import imgImage63 from "figma:asset/b7d2e8ed6819eeeb7ded21281c51aee1e21f3560.png";
import imgImage65 from "figma:asset/245a7d0f66b2a4c07c6f65541bd8759f79b07f71.png";
import imgImage64 from "figma:asset/fb0f675740e7a45b01389cb4ce27c94060bad387.png";
import img202506181329581 from "figma:asset/9b7202076eff513eea64bb69c831eb0b79536e8f.png";
import imgChatGptImage20202518014621 from "figma:asset/500bba79d883899973b579032f9cfc95b1761f39.png";

function MenuButton() {
  return (
    <div className="h-2.5 relative w-[17px]">
      <div className="absolute bottom-[-5%] left-0 right-0 top-[-5%]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 17 12"
        >
          <g id="Group 2085665467">
            <path
              d="M17 6L10.9412 6L5.85087 1H0"
              id="Vector 10"
              stroke="white"
            />
            <path
              d="M0 6L6.05882 6L11.1491 11H17"
              id="Vector 12"
              stroke="white"
            />
            <path
              d="M17 1H10.5"
              id="Vector 11"
              stroke="white"
            />
            <path
              d="M6.5 11H0"
              id="Vector 13"
              stroke="white"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

function PhoneIcon() {
  return (
    <div className="size-3">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 12 12"
      >
        <path
          clipRule="evenodd"
          d={svgPaths.p1ba51b80}
          fill="white"
          fillOpacity="0.4"
          fillRule="evenodd"
        />
      </svg>
    </div>
  );
}

function ArrowIcon({ className = "" }) {
  return (
    <div className={`h-[11px] w-[19px] ${className}`}>
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 13"
      >
        <path
          d={svgPaths.p2533c630}
          stroke="currentColor"
        />
      </svg>
    </div>
  );
}

function StarIcon() {
  return (
    <div className="size-[25px]">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 25 25"
      >
        <path
          d={svgPaths.p2ac03e00}
          fill="#FF4343"
        />
      </svg>
    </div>
  );
}

function Logo() {
  return (
    <div className="h-8 w-[104px]">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 104 32"
      >
        <path
          d={svgPaths.p1b162b90}
          fill="white"
        />
      </svg>
    </div>
  );
}

function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 p-4 md:p-8">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex-1 flex justify-start">
          <Logo />
        </div>

        {/* Address - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
          <div className="w-2 h-2 bg-white/40 rounded-full" />
          <span className="text-white text-sm font-medium tracking-[-0.28px]">
            Москва, 1-й Грайвороновский проезд, 20с19
          </span>
        </div>

        {/* Menu and Phone */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          {/* Phone */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex gap-1">
              <PhoneIcon />
              <PhoneIcon />
            </div>
            <span className="text-white text-sm font-medium tracking-[-0.28px]">
              8 (923) 050-88-88
            </span>
          </div>

          {/* Call button */}
          <div className="hidden md:block">
            <button className="text-white text-sm font-medium tracking-[-0.28px] border-b border-white pb-1">
              Заказать звонок
            </button>
          </div>

          {/* Menu */}
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="rotate-180 scale-y-[-1]">
              <MenuButton />
            </div>
            <span className="text-white text-sm font-medium tracking-[-0.28px]">
              Меню
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section 
      className="relative h-[921px] bg-black flex items-start pt-32 md:pt-40"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0) 76.381%, rgb(0, 0, 0) 100%), url('${imgChatGptImage20202518014621}')`,
        backgroundSize: 'auto, cover',
        backgroundPosition: '0% 0%, center center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Hero Content */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-[72px] font-medium text-white leading-[1.1] tracking-[-1.44px]">
              Экспертный<br />
              сервис LiXiang
            </h1>

            <p className="text-white text-base tracking-[-0.32px] leading-[1.5] max-w-[440px]">
              Профессиональное обслуживание и ремонт автомобилей LiXiang любого года выпуска и модели
            </p>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-black/30 rounded-lg px-5 py-3 text-white text-sm font-medium tracking-[-0.28px] flex items-center gap-3 justify-center">
                Заказать звонок
                <ArrowIcon className="scale-y-[-1]" />
              </button>

              <div className="backdrop-blur-sm bg-[rgba(27,32,38,0.5)] rounded-xl w-[150px] h-[150px] flex items-center justify-center border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:backdrop-blur-lg">
                <div className="text-center">
                  <div className="text-white text-sm font-medium tracking-[-0.28px] leading-[1.2] transition-colors duration-300 hover:text-white">
                    Заказать<br />звонок
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-8 lg:ml-auto">
            <div className="text-right">
              <div className="text-white text-4xl md:text-[56px] font-medium leading-[1.1] tracking-[-2.8px]">
                3 000+
              </div>
              <div className="text-white text-sm tracking-[-0.28px] leading-[1.5] mt-2">
                Довольных клиентов
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <div className="text-white text-4xl md:text-[56px] font-medium leading-[1.1] tracking-[-2.8px]">
                  5,0
                </div>
                <StarIcon />
              </div>
              <div className="text-white text-sm tracking-[-0.28px] leading-[1.5] mt-2">
                225 оценок на Яндекс
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PromoSection() {
  return (
    <section className="bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div 
          className="bg-[#0a1221] rounded-xl h-[271px] relative overflow-hidden"
          style={{ 
            backgroundImage: `url('${imgFrame1948755292}')`,
            backgroundSize: '138.6% 377.88%'
          }}
        >
          <div className="absolute inset-0">
            <div
              className="absolute h-[957px] w-full bg-cover bg-center bg-no-repeat -top-[336px] -left-[12px]"
              style={{ backgroundImage: `url('${imgDsc039441}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0f1200] to-[#0c0f12e0] backdrop-blur-[10px]" />
          </div>

          <div className="relative z-10 p-8 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-white text-2xl md:text-[36px] font-medium leading-[1.1] tracking-[-1.8px] mb-4">
                Комплексная диагностика LiXiang в подарок
              </h3>

              <p className="text-[#a0b3c4] text-base tracking-[-0.32px] leading-[1.5] max-w-[810px]">
                Специальное предложение для новых клиентов: при обращении в наш сервис для проведения 
                планового обслуживания или ремонта, вы получаете полную диагностику всех систем LiXiang в подарок
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="text-white text-sm font-medium tracking-[-0.28px] border-b border-[#a0b3c4] pb-1">
                  Подробнее
                </button>
                <ArrowIcon className="scale-y-[-1] text-white" />
              </div>

              <div className="hidden md:flex items-center gap-4">
                <button className="w-[42px] h-[42px] bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 flex items-center justify-center">
                  <ArrowIcon className="text-white rotate-180" />
                </button>
                <button className="w-[42px] h-[42px] bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 flex items-center justify-center">
                  <ArrowIcon className="text-white" />
                </button>
              </div>
            </div>

            <div className="absolute bottom-4 left-8 text-[#a0b3c4] text-xs font-semibold tracking-[-0.24px]">
              01
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ image, title, number, description, isHovered, onHover, onLeave }) {
  return (
    <div 
      className={`h-[528px] relative overflow-hidden bg-[#3a3a3a] bg-cover bg-center cursor-pointer transition-all duration-500 ease-out ${
        isHovered ? 'flex-[2]' : 'flex-1'
      }`}
      style={{ backgroundImage: `url('${image}')` }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Background overlay with blur effect */}
      <div className={`absolute inset-0 transition-all duration-500 ease-out ${
        isHovered ? 'bg-black/20' : 'bg-black/60 backdrop-blur-sm'
      }`} />
      
      <div className="relative h-full p-6 flex flex-col justify-between">
        {/* Vertical title - shown when not hovered */}
        <div className={`flex items-center justify-center h-full transition-all duration-500 ease-out ${
          isHovered ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}>
          <div className="rotate-[-90deg]">
            <h3 className="text-white text-2xl md:text-[28px] font-medium tracking-[-1.4px] text-center whitespace-nowrap">
              {title}
            </h3>
          </div>
        </div>

        {/* Horizontal content - shown when hovered */}
        <div className={`absolute bottom-0 left-0 right-0 p-6 transition-all duration-500 ease-out ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h4 className="text-white text-[28px] font-medium leading-[1.1] tracking-[-1.4px] mb-4">
            {title}
          </h4>
          {description && (
            <>
              <p className="text-[#a0b3c4] text-base tracking-[-0.32px] leading-[1.5] max-w-[440px] mb-6">
                {description}
              </p>
              
              <div className="flex items-center gap-3">
                <button className="text-white text-sm font-medium tracking-[-0.28px] border-b border-[#a0b3c4] pb-1">
                  Подробнее
                </button>
                <ArrowIcon className="scale-y-[-1] text-white" />
              </div>
            </>
          )}
        </div>

        {/* Number */}
        <div className={`absolute bottom-6 left-6 text-[#a0b3c4] text-xs font-medium tracking-[-0.24px] transition-all duration-500 ease-out ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}>
          {number}
        </div>
      </div>
    </div>
  );
}

function ServicesSection() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const services = [
    { 
      image: imgFrame1948755289, 
      title: "Сервис", 
      number: "01",
      description: "Профессиональное техническое обслуживание автомобилей LiXiang с использованием оригинальных запчастей"
    },
    { 
      image: imgFrame1948755291, 
      title: "Кузовной ремонт", 
      number: "02",
      description: "Профессиональный кузовной ремонт автомобилей LiXiang любого года выпуска и модели"
    },
    { 
      image: imgFrame1948755293, 
      title: "Дооснащение", 
      number: "03",
      description: "Установка дополнительного оборудования и аксессуаров для повышения комфорта и функциональности"
    },
    { 
      image: imgFrame1948755294, 
      title: "Детейлинг", 
      number: "04",
      description: "Профессиональная химчистка, полировка и защитные покрытия для сохранения первозданного вида автомобиля"
    },
    { 
      image: imgFrame1948755295, 
      title: "Продажа LiXiang", 
      number: "05",
      description: "Официальная продажа новых автомобилей LiXiang с полной гарантией и сервисным обслуживанием"
    }
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex gap-2.5 h-[528px] overflow-hidden">
          {services.map((service, index) => (
            <ServiceCard 
              key={index} 
              {...service} 
              isHovered={hoveredIndex === index}
              onHover={() => setHoveredIndex(index)}
              onLeave={() => setHoveredIndex(null)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProtectionSection() {
  const [activeTab, setActiveTab] = useState(0);
  
  const tabs = [
    "Базовая защита автомобиля",
    "Электронная адаптация", 
    "Техническое обслуживание",
    "Комфорт и эстетика",
    "Подготовка к зиме"
  ];

  const services = [
    "Установка брызговиков и защитных накладок на пороги",
    "Установка защиты картера и днища", 
    "Антикоррозийная обработка",
    "Оклейка кузова полиуретановой пленкой"
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-[48px] font-medium leading-[1.1] tracking-[-0.96px] text-black mb-8">
          Я купил LiXiang
        </h2>

        {/* Tabs */}
        <div className="flex flex-wrap gap-[11px] mb-16">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium tracking-[-0.28px] transition-colors ${
                index === activeTab
                  ? 'bg-black text-white'
                  : 'bg-[rgba(160,179,196,0.2)] text-black/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Services List */}
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="border-b border-[#a0b3c4] pb-1">
                <div className="flex items-center gap-3">
                  <span className="text-black text-sm font-medium tracking-[-0.28px]">
                    {service}
                  </span>
                  {index === services.length - 1 && (
                    <ArrowIcon className="scale-y-[-1] text-black" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Protection Card */}
          <div className="bg-gradient-to-b from-[#849ab2] to-[#64758c] rounded-xl h-[432px] overflow-hidden relative">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${img202506181329581}')` }}
            />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
          <div className="bg-gradient-to-br from-[#56CBD7] to-[#024C53] rounded-xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl md:text-[36px] font-medium leading-[1.1] tracking-[-0.72px] mb-4">
                Комплексная защита<br />
                кузова и ходовой
              </h3>
              
              <p className="text-white/80 text-base tracking-[-0.32px] leading-[1.5] mb-8">
                Оставьте заявку, менеджер свяжется<br />
                с вами и проконсультирует по услуге
              </p>

              <button className="bg-black/30 rounded-lg px-5 py-3 text-white text-sm font-medium tracking-[-0.28px] flex items-center gap-3">
                Заказать звонок
                <ArrowIcon className="scale-y-[-1]" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl md:text-[48px] font-medium leading-[1.1] tracking-[-0.96px] text-[#1a2737]">
              Эксперты по LiXiang работаем только<br />
              с вашей моделью
            </h3>
            
            <p className="text-[#1a2737] text-base tracking-[-0.32px] leading-[1.5]">
              Мы не просто сервис — мы узкие специалисты по автомобилям LiXiang. Наш фокус исключительно 
              на этой марке позволяет нам:
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Three.js Custom Cursor */}
      <ThreeJSCursor />
      
      {/* Main Content */}
      <div>
        <Header />
        <HeroSection />
        <PromoSection />
        <ServicesSection />
        <ProtectionSection />
      </div>
    </div>
  );
}