<script setup>
import samPhotoNoBgWithOrange2 from "../../assets/SamPhotoNoBackgroundWithOrange2.png";
import MazeExampleImage from "../../assets/MazeExampleImage.png";
import FlowerGameExampleVideo from "../../assets/FlowerGameExample.mp4";
import PokedexExampleImage from "../../assets/PokedexExampleImage.png";
import LinkedInLogo from "../../assets/LI-In-Bug.png";
import GitHubLogo from "../../assets/github-mark.png";
import InstagramLogo from "../../assets/Instagram_Glyph_Gradient.png";
import DeviantArtLogo from "../../assets/deviantart_logo.png";
import DiscordLogo from "../../assets/discord-mark-blue.png";
import WordleAssistantImage from "../../assets/WordleAssistantExample.png";
import SudokuExampleImage from "../../assets/SudokuExampleImage.png";
import { ref, onMounted } from "vue";

onMounted(() => {
  const fadeElementsLeft = document.querySelectorAll(".fade-in-left");
  const fadeElementsRight = document.querySelectorAll(".fade-in-right");

  if (window.innerWidth > 700) {
    window.addEventListener("scroll", () => {
      fadeElementsLeft.forEach((element) => {
        alterElement(element, -1);
      });

      fadeElementsRight.forEach((element) => {
        alterElement(element, 1);
      });
    });
  }
});

function alterElement(fadeElement, coefficient) {
  const windowHeight = window.innerHeight;
  const elementPosition = fadeElement.getBoundingClientRect();
  const elementHeight = fadeElement.clientHeight;
  let offset = 150;

  //For when the element approaches the top of the screen
  if (elementPosition.top - offset / 3 <= 0) {
    fadeElement.style.transform = `translateX(${
      coefficient *
      (100 * -((elementPosition.top - offset / 3) / elementHeight))
    }px)`;
    fadeElement.style.opacity =
      1 + (elementPosition.top - offset / 3) / elementHeight;
  }
  //For when the element isn't close to the top or bottom
  else if (elementHeight + offset < windowHeight - elementPosition.top) {
    fadeElement.style.transform = `translateX(${0}px)`;
    fadeElement.style.opacity = 1;
  }
  //For when the element approaches the bottom of the screen
  else {
    fadeElement.style.transform = `translateX(${
      coefficient *
      (100 -
        100 * ((windowHeight - elementPosition.top) / (elementHeight + offset)))
    }px)`;
    fadeElement.style.opacity =
      (windowHeight - elementPosition.top) / (elementHeight + offset);
  }
}
</script>

<template>
  <div class="personal background-light">
    <section class="left-image-right-text">
      <div class="image-container">
        <img
          :src="samPhotoNoBgWithOrange2"
          class="image fade-in-left background-main"
        />
      </div>

      <div class="text fade-in-right">
        <div class="text-container">
          <h1>Hi, I'm <span>Sam Walsh.</span></h1>
          <p class="role">Senior Frontend Engineer · Credera · Chicago, IL</p>
          <p class="subtext">
            I build web systems that perform at scale - and care about how they
            look and feel. At Credera I work with enterprise clients on
            everything from full-stack modernizations to large-scale rebrands.
          </p>
          <p class="subtext mt-4">
            When I'm not consulting I'm building personal projects due to a love
            of the craft.
          </p>
        </div>
      </div>
    </section>
    <section id="resume" class="card-group resume">
      <div class="header">
        <div class="left-content">Resume</div>
        <div class="right-content"></div>
      </div>
      <div class="full-width">
        <div class="card blue no-image">
          <div class="body">
            <h3>Experience</h3>
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-role">Senior Frontend Engineer</div>
                <div class="timeline-meta">
                  Credera · Full-time · Feb 2025 – Present · Hybrid, Chicago IL
                  (Aug 2025–)
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-role">Frontend Engineer</div>
                <div class="timeline-meta">
                  Credera · Full-time · Sep 2022 – Feb 2025 · Hybrid, Dallas TX
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-role">Summer Intern</div>
                <div class="timeline-meta">
                  Credera · Internship · May 2021 – Aug 2021 · Dallas TX
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-role">Resident Assistant</div>
                <div class="timeline-meta">
                  Southern Methodist University · Aug 2020 – May 2022 · Dallas
                  TX
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="half-width">
        <div class="card green no-image">
          <div class="body">
            <h3>Education</h3>
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-role">
                  Bachelor of Arts — Computer Science &amp; Creative Computation
                </div>
                <div class="timeline-meta">
                  Southern Methodist University · 2018 – 2022
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-role">Shady Side Academy</div>
                <div class="timeline-meta">2007 – 2018</div>
              </div>
            </div>
          </div>
        </div>
        <div class="card purple no-image">
          <div class="body">
            <h3>Skills</h3>
            <div class="skills-grid">
              <span class="skill-pill">HTML</span>
              <span class="skill-pill">JavaScript</span>
              <span class="skill-pill">CSS / SCSS</span>
              <span class="skill-pill">AngularJS</span>
              <span class="skill-pill">Angular Material</span>
              <span class="skill-pill">Adobe Experience Manager</span>
              <span class="skill-pill">AWS CloudFormation</span>
              <span class="skill-pill">Cache Management</span>
              <span class="skill-pill">dotCMS</span>
              <span class="skill-pill">Figma</span>
              <span class="skill-pill">LRU Caching</span>
              <span class="skill-pill">Microsoft Azure</span>
              <span class="skill-pill">Microsoft Copilot</span>
              <span class="skill-pill">Redis</span>
              <span class="skill-pill">Salesforce</span>
              <span class="skill-pill">State Management</span>
              <span class="skill-pill">User Acceptance Testing</span>
              <span class="skill-pill">Visual Studio</span>
              <span class="skill-pill">C++</span>
              <span class="skill-pill">Presentation Skills</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section
      id="professional-projects"
      class="card-group professional-projects"
    >
      <div class="header">
        <div class="left-content">Professional Projects</div>
        <div class="right-content"></div>
      </div>
      <div class="full-width">
        <div class="card orange no-image">
          <div class="body">
            <h3>Website Modernization for Memorabilia Manufacturer</h3>
            <p class="project-meta">Credera · Sep 2025 – Mar 2026</p>
            <p class="desc">
              Helped modernize a brand-new merchandise creation platform
              enabling businesses and schools to build custom storefronts for
              designing and distributing apparel. Key contributions:
            </p>
            <ul class="desc project-bullets">
              <li>
                Implemented a frontend cache system reducing average first-paint
                time by up to 400,000x — from minutes to seconds on high-data
                calls
              </li>
              <li>
                Standardized global state management across server-side and
                client-side rendering
              </li>
              <li>
                Built ad-hoc cache monitoring software used during live
                production testing to identify critical crashes
              </li>
              <li>
                Consulted on frontend architecture needs and served as on-call
                developer for Phase 1 release
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="full-width">
        <div class="card blue no-image">
          <div class="body">
            <h3>Website Modernization for Mid-Size Benefits Provider</h3>
            <p class="project-meta">Credera · Apr 2023 – Sep 2024</p>
            <p class="desc">
              Sole frontend developer for a complete overhaul of a benefits
              selection and ordering system, working directly with the client
              throughout. Key contributions:
            </p>
            <ul class="desc project-bullets">
              <li>
                Acted as the primary frontend point of contact, regularly
                meeting with client leads on architecture decisions
              </li>
              <li>
                Represented Credera in UAT sessions, presenting work and
                fielding questions from internal client testers
              </li>
              <li>
                Integrated the modernized experience into the existing legacy
                system with dual-environment support
              </li>
              <li>
                Implemented an emergency pagination feature to resolve a
                critical design issue before launch
              </li>
              <li>Served as on-call developer for Phase 1 release</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="full-width">
        <div class="card green no-image">
          <div class="body">
            <h3>Website Rebrand for Government Agency</h3>
            <p class="project-meta">Credera · Oct 2022 – Mar 2023</p>
            <p class="desc">
              Collaborated with an external design firm to execute a large-scale
              rebrand for a major US Government agency. Key contributions:
            </p>
            <ul class="desc project-bullets">
              <li>
                Rebranded key site components including navigation and image
                carousels
              </li>
              <li>
                Compiled a component-to-page inventory, reducing project
                complexity and saving team time
              </li>
              <li>
                Worked directly alongside non-Credera developers and designers
                from the partnered agency
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
    <section id="personal-projects" class="card-group examples-of-work">
      <div class="header">
        <div class="left-content">Personal Projects</div>
        <div class="right-content"></div>
      </div>
      <div class="full-width">
        <div class="card blue">
          <div class="body">
            <h3>Pokédex</h3>
            <p class="desc">
              A Pokédex application showcasing various Pokémon and information
              about them. Includes thorough data and competitive statistics from
              external APIs, and the ability to create a team.
            </p>
            <p class="desc">
              Some tech utilized in this project: GitHub Copilot, v0 for
              component generation, PokeAPI for API calls, Amazon AWS Amplify
              for hosting, authentication, and various other services
            </p>
            <a href="https://dex.kryptsm.com" class="link">
              Click here to see it!
            </a>
          </div>
          <div class="image-container">
            <img :src="PokedexExampleImage" />
          </div>
        </div>
      </div>
      <div class="full-width">
        <div class="card orange">
          <div class="body">
            <h3>Wordle Assistant</h3>
            <p class="desc">
              An assistant program that helps you complete the Wordle each day.
              Will even suggest words to use, but this is considered cheating!
            </p>
            <p class="desc">
              Some tech utilized in this project: GitHub Copilot (Vibe Coding)
            </p>
            <router-link :to="{ name: 'wordle' }" class="link">
              Click here to see it!
            </router-link>
          </div>
          <div class="image-container">
            <img :src="WordleAssistantImage" />
          </div>
        </div>
      </div>
      <div class="full-width">
        <div class="card purple">
          <div class="body">
            <h3>Sudoku Solver</h3>
            <p class="desc">
              A program that solves Sudoku puzzles using a backtracking
              algorithm. If it runs into an issue with a number, it backtracks
              and tries alternate approaches. Also can calculate potential
              number options for each empty cell.
            </p>
            <p class="desc">
              Some tech utilized in this project: GitHub Copilot (Vibe Coding),
              Depth First Search algorithm
            </p>
            <router-link :to="{ name: 'sudoku' }" class="link">
              Click here to see it!
            </router-link>
          </div>
          <div class="image-container">
            <img :src="SudokuExampleImage" />
          </div>
        </div>
      </div>
      <div class="full-width">
        <div class="card green">
          <div class="body">
            <h3>Texas Hold'em Odds Calculator</h3>
            <p class="desc">
              A comprehensive poker odds calculator showing pre-flop win rates
              for all 169 starting hands. Uses Monte Carlo simulation to
              calculate exact probabilities based on number of players. Perfect
              for learning hand strength and making mathematically optimal
              decisions.
            </p>
            <p class="desc">
              Some tech utilized in this project: Monte Carlo simulation, poker
              hand evaluation algorithms, dynamic odds tables
            </p>
            <router-link :to="{ name: 'poker' }" class="link">
              Click here to see it!
            </router-link>
          </div>
          <div class="image-container placeholder-poker">
            <div
              style="
                background: linear-gradient(135deg, #065f46 0%, #047857 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                font-size: 6rem;
              "
            >
              🃏
            </div>
          </div>
        </div>
      </div>
      <div class="full-width">
        <div class="card red">
          <div class="body">
            <h3>Maze Solver</h3>
            <p class="desc">
              A basic program to find the path from the beginning to the end of
              a randomly generated maze. Based on a program as part of my
              college education, reimagined with javascript and design.
            </p>
            <p class="desc">
              Some tech utilized in this project: Basic breadth-first search
            </p>
            <router-link :to="{ name: 'maze-solver' }" class="link">
              Click here to see it!
            </router-link>
          </div>
          <div class="image-container">
            <img :src="MazeExampleImage" />
          </div>
        </div>
      </div>
      <div class="full-width">
        <div class="card red">
          <div class="body">
            <h3>Flower Game</h3>
            <p class="desc">
              A visual recreation of the cellular automation Conway's Game of
              Life created by mathematition John Horton Conway in 1970.
            </p>
            <router-link :to="{ name: 'flower-game' }" class="link">
              Click here to see it!
            </router-link>
          </div>
          <div class="image-container">
            <video controls loop autoplay>
              <source :src="FlowerGameExampleVideo" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
      <!-- <div class="full-width">
				<div class="card blue">
					<div class="body">
						<h3>Food Tracker</h3>
						<p class="desc">
							A food tracking application showing off a more typical application
							I develop. Meant to track your meals over time, allows you to rate
							them, and see summaries about them.
						</p>
						<router-link :to="{ name: 'food-tracker' }" class="link">
							Click here to see it!
						</router-link>
					</div>
					<div class="image-container">
						<img :src="FoodTrackerExampleImage" />
					</div>
				</div>
			</div> -->
    </section>
    <section id="contact" class="card-group ways-to-reach-me">
      <div class="header">
        <div class="left-content">Ways to Reach Me</div>
        <div class="right-content"></div>
      </div>
      <div class="half-width">
        <div class="card blue">
          <div class="body">
            <h3>LinkedIn</h3>
            <p class="desc">
              My place for any professional-based information, such as
              educational history and employment. Also lists various work
              projects I've worked on and specific roles performed.
            </p>
            <a
              class="link"
              href="https://linkedin.com/in/kryptsm"
              target="_blank"
            >
              Click here to go to LinkedIn!
            </a>
          </div>
          <div class="image-container">
            <img :src="LinkedInLogo" />
          </div>
        </div>
        <div class="card orange">
          <div class="body">
            <h3>GitHub</h3>
            <p class="desc">
              Where you can find various code I've written. Only personal
              projects or school work, as any professional work is privileged.
            </p>
            <a class="link" href="https://github.com/Kryptsm" target="_blank">
              Click here to go to my profile!
            </a>
          </div>
          <div class="image-container">
            <img :src="GitHubLogo" />
          </div>
        </div>
      </div>
      <div class="half-width">
        <div class="card purple">
          <div class="body">
            <h3>Instagram</h3>
            <p class="desc">
              On a more personal note, follow me on instagram to see what I am
              up to non-professionally.
            </p>
            <a
              class="link"
              href="https://instagram.com/kryptsm"
              target="_blank"
            >
              My user is Kryptsm, or click here!
            </a>
          </div>
          <div class="image-container">
            <img :src="InstagramLogo" />
          </div>
        </div>
        <div class="card green">
          <div class="body">
            <h3>DeviantArt</h3>
            <p class="desc">
              I do art in my free time for enjoyment. Check some of my digital
              art here!
            </p>
            <a
              class="link"
              href="https://www.deviantart.com/kryptsm"
              target="_blank"
            >
              Click here to see it!
            </a>
          </div>
          <div class="image-container">
            <img :src="DeviantArtLogo" />
          </div>
        </div>
      </div>
      <div class="full-width">
        <div class="card yellow">
          <div class="body">
            <h3>Discord</h3>
            <p class="desc">
              If you want to casually reach out to me, my username on Discord is
              Kryptsm. This is where I generally keep contact with friends.
            </p>
          </div>
          <div class="image-container">
            <img :src="DiscordLogo" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.personal {
  margin-bottom: 60px;
  padding: 0 25px;
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;

  .left-image-right-text {
    width: 100vw;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    padding: 80px max(25px, calc((100vw - 1050px) / 2)) 70px;

    .text {
      padding: 0 15px 0 35px;

      h1,
      .subtext {
        text-align: right;
      }

      h1 span {
        white-space: nowrap;
        color: #ea7d1c;
      }

      .role {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #888;
        text-align: right;
        margin-bottom: 20px;
        text-transform: uppercase;
      }
    }
  }
  .left-text-right-image {
    .text {
      padding: 0 20px;
      h1,
      .subtext {
        text-align: left;
      }
    }
  }
  .left-image-right-text,
  .left-text-right-image {
    display: flex;
    // height: 450px;

    .image-container {
      width: 50%;
      height: 100%;
      align-self: center;
      .image {
        width: 100%;
        height: auto;
        padding: 0 25px;
      }
    }

    .extra-space {
      padding: 25px;
    }

    .text {
      width: 50%;
      display: flex;
      text-align: center;
      align-items: center;
      justify-content: flex-end;
      color: #281c2d;
      padding-bottom: 30px;

      h1 {
        font-size: 68px;
        line-height: 1.05;
        font-weight: 800;
        margin-bottom: 20px;
      }

      .subtext {
        font-size: 20px;
        line-height: 26px;
        font-weight: 500;
      }
    }

    @media only screen and (max-width: 700px) {
      flex-direction: column-reverse;
      align-items: center;

      .image-container,
      .width {
        max-width: calc(100% - 10vw);
        width: unset;
        margin: 0 auto;
      }

      .text {
        padding-left: 10px;
        padding-right: 10px;
        margin: 25px 0;
        width: 100%;
        h1,
        .subtext,
        .role {
          text-align: center;
        }

        h1 {
          font-size: 42px;
          line-height: 1.05;
          font-weight: 800;
          margin-bottom: 20px;
        }

        .subtext {
          font-size: 20px;
          line-height: 24px;
          font-weight: 500;
        }
      }
    }
  }
  .card-group {
    margin: auto;
    margin-top: 60px;

    .header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 0 0 8px 16px;
      margin-bottom: 24px;
      border-left: 4px solid #ea7d1c;

      .left-content {
        font-weight: 800;
        font-size: 28px;
        letter-spacing: -0.5px;
        color: #281c2d;
      }
    }

    .full-width,
    .half-width {
      padding: 15px 0;
      width: 100%;

      .card {
        height: auto;
        min-height: 250px;
        overflow: hidden;
        border-radius: 8px;
        padding: 30px;
        display: flex;
        gap: 10px;

        border: 2px solid rgb(230, 230, 230);
        background-color: rgb(252, 252, 252);
        box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
        transition: box-shadow 0.2s ease;

        &:hover {
          box-shadow: 0 6px 28px rgba(0, 0, 0, 0.1);
        }

        &.green {
          border: 2px solid #4d9e5b;
          background-color: #f2fdf2;
        }

        &.red {
          border: 2px solid #a75c5c;
          background-color: #f7ebeb;
        }

        &.blue {
          border: 2px solid #565f9e;
          background-color: #edeef8;
        }

        &.purple {
          border: 2px solid rgb(144, 74, 158);
          background-color: rgb(252, 241, 255);
        }

        &.orange {
          border: 2px solid rgb(207, 148, 38);
          background-color: rgb(250, 243, 230);
        }

        &.yellow {
          border: 2px solid rgb(207, 207, 31);
          background-color: rgb(253, 253, 238);
        }

        .body,
        .image-container {
          width: 50%;
          height: auto;
          object-fit: cover;
          align-self: center;
        }

        .image-container {
          img,
          video {
            height: 100%;
            object-fit: cover;
            margin: auto;
          }
        }

        .body {
          padding-right: 30px;
          h3 {
            font-size: 22px;
            font-weight: 700;
            padding-bottom: 10px;
            letter-spacing: -0.3px;
          }

          .desc {
            padding-bottom: 10px;
            line-height: 1.6;
          }

          .link {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-weight: 600;
            font-size: 14px;
            text-decoration: none;
            color: #281c2d;
            border-bottom: 2px solid currentColor;
            padding-bottom: 1px;
            cursor: pointer;
            transition: opacity 0.15s;

            &::after {
              content: " →";
            }

            &:hover {
              opacity: 0.65;
            }
          }
        }

        @media only screen and (max-width: 500px) {
          .image-container {
            display: none;
          }

          .body {
            width: 100%;
          }
        }
      }
    }

    .half-width {
      display: flex;
      gap: 30px;

      .card {
        width: 50%;
        margin: 0 auto;
        .body {
          width: 70%;
        }
        .image-container {
          width: 30%;
          height: auto;
        }
      }

      @media only screen and (max-width: 700px) {
        display: block;

        .card + .card {
          margin-top: 30px;
        }

        .card {
          width: 100%;
          margin: 0;
        }
      }

      @media only screen and (max-width: 500px) {
        .card {
          .body {
            width: 100%;
          }
        }
      }
    }

    .card.no-image {
      .body {
        width: 100%;
        padding-right: 0;
      }
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 10px;

      .timeline-item {
        padding-left: 14px;
        border-left: 3px solid #ea7d1c;

        .timeline-role {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 3px;
        }

        .timeline-meta {
          font-size: 13px;
          color: #555;
        }
      }
    }

    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding-top: 10px;

      .skill-pill {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
        background: rgba(0, 0, 0, 0.07);
        border: 1px solid rgba(0, 0, 0, 0.12);
      }
    }

    .project-meta {
      font-size: 14px;
      font-weight: 600;
      color: #555;
      margin-bottom: 8px;
    }

    .project-bullets {
      list-style: disc;
      padding-left: 20px;

      li {
        padding-bottom: 4px;
      }
    }
  }

  .ways-to-reach-me {
    .full-width .card .image-container {
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        max-height: 120px;
        max-width: 120px;
        width: auto;
        height: auto;
        object-fit: contain;
      }
    }
  }
}
</style>
