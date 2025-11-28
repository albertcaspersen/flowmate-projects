<template>
  <div class="contents">
    <!-- Feature Box 1 -->
    <slot name="feature-box-1-content">
      <div class="flex flex-col items-start gap-4 row-[3] col-[1/7] lg:col-[7/10] md:col-[1/7] max-[480px]:col-[1/13]">
        <h3 class="text-2xl font-bold text-white m-0 leading-tight lg:text-xl max-[480px]:text-lg font-sans">
          Nemt og fleksibelt
        </h3>
        <p class="text-base leading-relaxed text-white/85 m-0 font-normal font-sans lg:text-[0.95rem] max-[480px]:text-[0.9rem]">
          Med Flowmate klarer vi alt – design, opdateringer, hosting og sikkerhed. Så kan du fokusere fuldt ud på din forretning. Opdatér dit indhold, når det passer dig. Vi klarer det gerne for dig – eller du kan selv tage styringen med Flowmates realtime editor.
        </p>
      </div>
    </slot>

    <!-- Feature Box 2 -->
    <slot name="feature-box-2-content">
      <div class="flex flex-col items-start gap-4 row-[3] col-[7/13] lg:col-[10/13] md:col-[1/7] max-[480px]:col-[1/13]">
        <h3 class="text-2xl font-bold text-white m-0 leading-tight lg:text-xl max-[480px]:text-lg font-sans">
          Altid klar til at hjælpe og forbedre
        </h3>
        <p class="text-base leading-relaxed text-white/85 m-0 font-normal font-sans lg:text-[0.95rem] max-[480px]:text-[0.9rem]">
          Vi står klar med hurtige svar. Hos os får du kreativ teknologi med en personlig tilgang. Vi tager en iterativ tilgang til både vores arbejde og praksis, altid på udkig efter måder at forbedre det vi gør.
        </p>
      </div>
    </slot>
  </div>
</template>

