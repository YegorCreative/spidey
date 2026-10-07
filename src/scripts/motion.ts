const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function paintStatic() {
  document.querySelectorAll<HTMLElement>("[data-draw]").forEach((el) => {
    el.style.setProperty("--draw", "1");
  });
  document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    el.classList.add("is-in");
  });
  document.querySelectorAll<HTMLElement>("[data-node]").forEach((el) => {
    el.classList.add("is-lit");
  });
}

if (reduced) {
  paintStatic();
} else try {
  const stages = [...document.querySelectorAll<HTMLElement>("[data-parallax]")];
  const draws = [...document.querySelectorAll<HTMLElement>("[data-draw]")];
  const mobileQuery = window.matchMedia("(max-width: 759px)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  type Box = { el: HTMLElement; top: number; height: number };
  let stageBoxes: Box[] = [];
  let drawBoxes: Box[] = [];

  const measure = () => {
    const y = window.scrollY;
    const read = (el: HTMLElement): Box => {
      const rect = el.getBoundingClientRect();
      return { el, top: rect.top + y, height: rect.height };
    };
    stageBoxes = stages.map(read);
    drawBoxes = draws.map(read);
  };

  let frame = 0;
  const update = () => {
    frame = 0;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const damp = mobileQuery.matches ? 0.4 : 1;
    document.querySelector(".header")?.toggleAttribute("data-scrolled", y > 8);

    for (const box of stageBoxes) {
      if (box.top > y + vh + 120 || box.top + box.height < y - 120) continue;
      const centerDelta = box.top - y + box.height / 2 - vh / 2;
      const shift = Math.max(-280, Math.min(280, centerDelta)) * damp;
      box.el.style.setProperty("--shift", `${shift.toFixed(2)}px`);
    }

    for (const box of drawBoxes) {
      const start = box.top - vh * 0.72;
      const end = box.top + box.height - vh * 0.32;
      const progress = (y - start) / Math.max(1, end - start);
      box.el.style.setProperty("--draw", Math.max(0, Math.min(1, progress)).toFixed(3));
    }
  };

  const requestUpdate = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  measure();
  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measure();
      update();
    }, 140);
  });
  window.addEventListener("load", () => {
    measure();
    update();
  });
  document.fonts?.ready.then(() => {
    measure();
    update();
  }).catch(() => undefined);

  const hero = document.querySelector<HTMLElement>("[data-parallax-pointer]");
  if (hero && finePointer && !mobileQuery.matches) {
    let px = 0;
    let py = 0;
    let pointerFrame = 0;
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      px = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
      py = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
      if (!pointerFrame) {
        pointerFrame = requestAnimationFrame(() => {
          pointerFrame = 0;
          hero.style.setProperty("--mx", `${px.toFixed(2)}px`);
          hero.style.setProperty("--my", `${py.toFixed(2)}px`);
        });
      }
    });
    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--mx", "0px");
      hero.style.setProperty("--my", "0px");
    });
  }

  const revealables = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (revealables.length && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    revealables.forEach((el) => revealObserver.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("is-in"));
  }

  const nodes = document.querySelectorAll<HTMLElement>("[data-node]");
  if (nodes.length && "IntersectionObserver" in window) {
    const nodeObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-lit");
          nodeObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.45 },
    );
    nodes.forEach((el) => nodeObserver.observe(el));
  } else {
    nodes.forEach((el) => el.classList.add("is-lit"));
  }
} catch {
  paintStatic();
}
