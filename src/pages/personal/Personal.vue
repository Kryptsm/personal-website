<script setup>
import PersonalBanner from "./components/PersonalBanner.vue";
import ProfileActions from "./components/ProfileActions.vue";
import samPhotoNoBgWithOrange2 from "../../assets/SamPhotoNoBackgroundWithOrange2.png";
import MazeExampleImage from "../../assets/MazeExampleImage.png";
import FlowerGameExampleVideo from "../../assets/FlowerGameExample.mp4";
import FoodTrackerExampleImage from "../../assets/FoodTrackerExampleImage.png";
import LinkedInLogo from "../../assets/LI-In-Bug.png";
import GitHubLogo from "../../assets/github-mark.png";
import InstagramLogo from "../../assets/Instagram_Glyph_Gradient.png";
import DeviantArtLogo from "../../assets/deviantart_logo.png";
import DiscordLogo from "../../assets/discord-mark-blue.png";
import Header from "../shared/Header.vue";
import { ref, onMounted } from "vue";

onMounted(() => {
	const fadeElementsLeft = document.querySelectorAll(".fade-in-left");
	const fadeElementsRight = document.querySelectorAll(".fade-in-right");

	window.addEventListener("scroll", () => {
		fadeElementsLeft.forEach((element) => {
			alterElement(element, -1);
		});

		fadeElementsRight.forEach((element) => {
			alterElement(element, 1);
		});
	});
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
					<h1>Hello, my name is Sam Walsh!</h1>
					<p class="subtext">
						I create websites for a living and for fun. Graduating from Southern
						Methodist Univeristy in 2022, I have been a front end engineer ever
						since, with a passion for constructing smart and interactive user
						experiences.
					</p>
				</div>
			</div>
		</section>
		<section class="card-group examples-of-work">
			<div class="header">
				<div class="left-content">Examples of Work</div>
				<div class="right-content"></div>
			</div>
			<div class="full-width">
				<div class="card green">
					<div class="body">
						<h3>Maze Solver</h3>
						<p class="desc">
							A basic program to find the path from the beginning to the end of
							a randomly generated maze. Based on a program as part of my
							college education, reimagined with javascript and design.
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
			<div class="full-width">
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
			</div>
		</section>
		<section class="card-group ways-to-reach-me">
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
			<div class="half-width">
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
	margin-bottom: 40px;
	padding: 25px 25px 0 25px;

	.left-image-right-text {
		.text {
			padding: 0 15px;
			h1,
			.subtext {
				text-align: right;
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
			margin-top: auto;
			.image {
				height: 100%;
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
				font-size: 45px;
				line-height: 45px;
				font-weight: 700;
				margin-bottom: 20px;
			}

			.subtext {
				font-size: 20px;
				line-height: 24px;
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
				padding-right: 0;
				margin: 25px 0;
				width: 100%;
				h1,
				.subtext {
					text-align: center;
				}

				h1 {
					font-size: 30px;
					line-height: 30px;
					font-weight: 700;
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
		margin-top: 45px;

		.header {
			display: flex;
			justify-content: space-between;
			padding: 5px 0;
			margin-bottom: 15px;
			border-bottom: 1px solid rgb(184, 184, 184);

			.left-content {
				font-weight: 700;
				font-size: 20px;
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
						font-size: 20px;
						font-weight: 700;
						padding-bottom: 10px;
					}

					.desc {
						padding-bottom: 10px;
					}

					.link {
						text-decoration: underline;
						cursor: pointer;
						text-underline-offset: 2px;
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
	}
}
</style>
