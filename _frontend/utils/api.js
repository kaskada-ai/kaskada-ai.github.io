// Dependencies
import axios from "axios";

// Constants
const EVENTS_API = "/api/events.json";
const BLOG_API = "/api/blog.json";

function getBaseUrl() {
  const BASE_URL = window.kaskada.BASE_URL;

  return BASE_URL.replace(/\/$/, "");
}

/**
 * Get the events from the API
 *
 * @return {Promise}
 */
export async function getEvents() {
  try {
    const response = await axios.get(getBaseUrl() + EVENTS_API);
    const { events } = response.data;

    return (events || []).map((event) => ({
      ...event,
      type: "event",
    }));
  } catch (error) {
    console.log(error);
    return [];
  }
}

/**
 * Get the blog posts from the API
 *
 * @return {Promise}
 */
export async function getBlogPosts() {
  try {
    const response = await axios.get(getBaseUrl() + BLOG_API);
    const { posts } = response.data;

    return (posts || []).map((post) => ({
      ...post,
      type: "post",
    }));
  } catch (error) {
    console.log(error);
    return [];
  }
}
